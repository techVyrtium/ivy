import {
  sendCrmJsonData,
  convertCurrency,
  sendMailProposal,
  createCustomerFolder,
} from "./webhooks";
import {
  getOrCreateThread,
  sendMessageToThread,
  runAssistant,
  getLastAssistantMessage,
  handleErrorResponse,
  pollRunStatus,
  getRoundedTimestamp,
  handlePendingAction,
} from "./utils";
import { CLOSING_REGEX } from "@/utils/closingRegex";
import {
  haveAllData,
  verifyDataStructure,
  getMissingFields,
  validateMailStructure,
} from "../../../utils/chatUtils";

// Estado global para rastrear el estado del CRM por thread
const crmState = new Map();

// Estado global para manejar las acciones pendientes
const pendingActions = new Map();

// Estado global para rastrear la carpeta de Google Drive por thread
const folderState = new Map();

// Estado global para correos pendientes
const pendingEmail = new Map();

export async function POST(req) {
  //  Aquí obtenemos las llaves secretas para usar el asistente inteligente y otras herramientas
  const assistant_id = process.env.OPENAI_ASSISTANT_ID;
  const api_key = process.env.OPENAI_API_KEY;

  // Aquí guardamos las direcciones de las herramientas que podemos usar (como guardar datos o convertir moneda)
  const webhookMap = {
    createCustomerFolder: process.env.WEBHOOK_CREATE_CLIENT_FOLDER,
    sendCrmJsonData: process.env.WEBHOOK_SEND_CRM_DATA,
    sendMailProposal: process.env.WEBHOOK_SEND_MAIL_PROPOSAL,
    convertCurrency: process.env.WEBHOOK_CONVERT_CURRENCY,
  };

  //  Aquí leemos el mensaje que nos envió el usuario y si ya hay una conversación previa
  const body = await req.json();
  const { userMessage, threadId: existingThreadId } = body;
  console.log("📬 Nuevo mensaje recibido:", {
    conversaciónPrevia: existingThreadId
      ? "Continuando conversación existente"
      : "Iniciando nueva conversación",
    caracteresDelMensaje: userMessage?.length || 0,
  });

  let threadId;
  let currentStatus = "processing";

  try {
    // 1. Obtener o crear thread
    threadId = await getOrCreateThread(existingThreadId, api_key);

    // 2. Verificar si hay un run activo
    if (existingThreadId) {
      try {
        // Construir la URL completa usando el host del request
        const host = req.headers.get("host");
        const protocol =
          process.env.NODE_ENV === "development" ? "http" : "https";
        const runStatusRes = await fetch(
          `${protocol}://${host}/api/chat/runStatus?threadId=${threadId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (runStatusRes.ok) {
          const { status, runId } = await runStatusRes.json();
          if (status === "in_progress" || status === "queued") {
            console.log(
              `⏳ Hay un run activo (${runId}) con estado ${status}, esperando...`
            );
            // Esperamos a que el run se complete
            const completedRun = await pollRunStatus(threadId, runId, api_key);
            console.log(
              `✅ Run ${runId} completado con estado ${completedRun.status}`
            );
          }
        }
      } catch (error) {
        console.warn("⚠️ Error al verificar runs activos:", error);
        // Continuamos aunque falle la verificación
      }
    }

    // 3. Enviar mensaje al thread
    await sendMessageToThread(threadId, userMessage, api_key);

    // 4. Iniciar y monitorear run
    let checkData = await runAssistant(threadId, assistant_id, api_key);
    let status = checkData.status;
    let runId = checkData.id;

    // Si el asistente nos pide hacer una acción especial
    if (status === "requires_action") {
      console.log(
        "🔧 El asistente ha solicitado una ACCIÓN ESPECIAL (requires_action) 🚨"
      );

      // Inicializamos un array vacío para almacenar los resultados de las herramientas
      const toolOutputs = [];
      // Extraemos la lista de llamadas a herramientas que el asistente ha solicitado ejecutar
      const toolCalls =
        checkData.required_action.submit_tool_outputs.tool_calls;

      // Procesamos cada acción requerida
      for (const toolCall of toolCalls) {
        const toolName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        const webhookUrl = webhookMap[toolName];
        let output = "Error ejecutando acción";

        console.log("🛠️ Instrucción del asistente:", { toolName, args });
        if (webhookUrl) {
          try {
            // Actualizamos el estado según la acción
            switch (toolName) {
              case "convertCurrency":
                currentStatus = "converting";
                break;
              case "sendCrmJsonData":
                currentStatus = "analyzing";
                break;
              case "sendMailProposal":
                currentStatus = "generating";
                break;
              case "createCustomerFolder":
                currentStatus = "processing";
                break;
              default:
                currentStatus = "processing";
            }

            if (toolName === "sendCrmJsonData") {
              // Agregamos el threadId automáticamente antes de cualquier validación
              if (!args.cliente) {
                args.cliente = {};
              }
              args.cliente.threadId = threadId;
            } else if (toolName === "convertCurrency") {
              output = await convertCurrency(args, webhookUrl, threadId);
            } else if (toolName === "createCustomerFolder") {
              output = await createCustomerFolder(args, webhookUrl, threadId);
              if (typeof output === "object" && output.folderLink) {
                folderState.set(threadId, output.folderLink);
                console.log(
                  "📁 Carpeta de Drive creada para thread:",
                  threadId
                );
              }
            }

            console.log(`✅ Resultado de la acción (${toolName}):`, output);
          } catch (toolError) {
            console.error(`❌ Error en la acción (${toolName}):`, toolError);
            output = `Error: ${toolError.message}`;
          }
        } else {
          console.warn(`⚠️ No se encontró webhook para ${toolName}`);
          output = `Error: Webhook para ${toolName} no configurado.`;
        }
        toolOutputs.push({ tool_call_id: toolCall.id, output });
      }

      // 3.1. Enviamos los resultados de vuelta al asistente
      console.log("📤 Enviando resultados de acciones al asistente...");
      const submitRes = await fetch(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runId}/submit_tool_outputs`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${api_key}`,
            "Content-Type": "application/json",
            "OpenAI-Beta": "assistants=v2",
          },
          body: JSON.stringify({ tool_outputs: toolOutputs }),
        }
      );

      if (!submitRes.ok) {
        const text = await submitRes.text();
        throw new Error(`Error al enviar resultados de acciones: ${text}`);
      }
      console.log("📨 Resultados enviados.");

      // 3.2. Esperamos de nuevo a que el asistente procese los resultados
      console.log(
        "⏳ Esperando respuesta del asistente después de la acción..."
      );
      checkData = await pollRunStatus(threadId, runId, api_key);
      status = checkData.status;
      runId = checkData.id;
    }

    // Si el asistente tarda demasiado (incluso después de la acción), avisamos
    if (status === "in_progress" || status === "queued") {
      console.log("⏳ Tiempo de espera excedido después de posible acción:", {
        estado: status,
        identificador: runId,
      });
      return new Response(
        JSON.stringify({
          error:
            "Lo siento, estoy tardando más de lo esperado en procesar tu mensaje. Por favor, inténtalo de nuevo en unos momentos.",
        }),
        { status: 500 }
      );
    }

    // Si el run falló
    if (status === "failed") {
      console.error(
        "❌ El run del asistente ha fallado:",
        checkData.last_error
      );
      return new Response(
        JSON.stringify({
          error: `Lo siento, hubo un error procesando la solicitud: ${
            checkData.last_error?.message || "Error desconocido"
          }`,
        }),
        { status: 500 }
      );
    }

    // 4. Obtener el último mensaje del asistente (ahora sí, el final)
    const lastAssistantMsg = await getLastAssistantMessage(threadId, api_key);
    const finalText =
      lastAssistantMsg?.content?.[0]?.text?.value ||
      "Lo siento, parece que no pude generar una respuesta clara esta vez. ¿Intentamos de nuevo?";

    // Verificamos si es un mensaje de cierre
    const isClosing = CLOSING_REGEX.some((regex) => regex.test(finalText));

    // Si es un mensaje de cierre y no hay carpeta creada, indicamos que se necesita crear una
    if (isClosing && !folderState.get(threadId)) {
      return new Response(
        JSON.stringify({
          threadId,
          response: finalText,
          processingStatus: currentStatus,
          timestamp: getRoundedTimestamp(),
          needsFolder: true,
        }),
        { status: 200 }
      );
    }

    console.log("📝 Respuesta final del asistente:", finalText);
    console.log(
      "🗂️ Datos completos del mensaje final:",
      JSON.stringify(lastAssistantMsg, null, 2)
    );
    console.log("🤖 Respuesta preparada:", {
      caracteres: finalText.length,
      hora: new Date().toISOString(),
      identificadorConversación: threadId,
    });

    // Enviamos la respuesta final al usuario con el estado de procesamiento y la hora redondeada
    return new Response(
      JSON.stringify({
        threadId,
        runId,
        response: finalText,
        processingStatus: currentStatus,
        timestamp: getRoundedTimestamp(),
        folderUrl: folderState.get(threadId) || null,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error en la petición:", error);

    // Si el error es por un run activo y tenemos una acción pendiente, la manejamos
    if (
      error.message.includes("while a run is active") &&
      pendingActions.has(threadId)
    ) {
      console.log(
        `🔄 Run activo detectado para thread ${threadId}, la acción pendiente se manejará automáticamente`
      );
      return new Response(
        JSON.stringify({
          message:
            "Tu solicitud está siendo procesada. Por favor, espera un momento...",
          threadId,
          processingStatus: "processing",
        }),
        { status: 200 }
      );
    }

    // Para otros errores, usamos el manejo de errores existente
    return handleErrorResponse(error, threadId);
  }
}
