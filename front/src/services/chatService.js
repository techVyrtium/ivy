
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_BACK;

export async function sendChatMessage({ userMessage, threadId }) {
  const res = await fetch(
    `${API_BASE_URL}/ask-to-agent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage, sessionId: threadId }),
    }
  );
  const data = await res.json();

  return data.data;
}

export async function getConversation(conversationId) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/conversation/${conversationId}`
    );

    if (!res.ok) {
      console.warn(`API returned status: ${res.status}`);
      return [];
    }

    const data = await res.json();

    // Validate data structure before returning
    if (data && data.data && Array.isArray(data.data.messages)) {
      // Ensure each message has the required properties
      return data.data.messages.map((msg) => {
        if (msg?.sender) {
          if (msg.sender === "client") {
            msg.role = "user";
          } else {
            msg.role = "assistant";
          }
        }

        return {
          content: msg.message || "",
          // Preserve other properties
          ...msg,
        };
      });
    } else {
      console.warn("Invalid data format received:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return [];
  }
}
