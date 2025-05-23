import { useEffect, useRef, useState } from 'react';

export const CallModal = ({ isOpen, onClose }) => {
  const [isAssistantTalking, setIsAssistantTalking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const wsRef = useRef(null);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Deepgram WebSocket endpoint
    const DEEPGRAM_API_KEY = '8abd6e1342bcb2b6845d355a091a15afd65fb20c'; // ¡Pon tu API Key aquí!
    const deepgramUrl = `wss://api.deepgram.com/v1/listen?punctuate=true&interim_results=true`;

    console.log("Intentando abrir WebSocket con Deepgram...");
    // Abrir WebSocket
    const ws = new WebSocket(deepgramUrl, [
      'token',
      DEEPGRAM_API_KEY
    ]);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket abierto correctamente.");
      // Acceder al micrófono
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        console.log("Acceso al micrófono concedido.");
        mediaStreamRef.current = stream;
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (e) => {
          if (ws.readyState === 1) {
            const inputData = e.inputBuffer.getChannelData(0);
            const buffer = new ArrayBuffer(inputData.length * 2);
            const view = new DataView(buffer);
            for (let i = 0; i < inputData.length; i++) {
              view.setInt16(i * 2, inputData[i] * 0x7fff, true);
            }
            ws.send(buffer);
          }
        };

        ws.onclose = () => {
          console.log("WebSocket cerrado (desde getUserMedia).");
          processor.disconnect();
          source.disconnect();
          audioContext.close();
          stream.getTracks().forEach(track => track.stop());
        };
      }).catch((err) => {
        console.error("Error al acceder al micrófono:", err);
      });
    };

    ws.onerror = (e) => {
      console.error("Error en WebSocket:", e);
    };

    ws.onclose = (e) => {
      console.log("WebSocket cerrado (evento global):", e);
    };

    ws.onmessage = (msg) => {
      console.log("Mensaje recibido de Deepgram:", msg.data);
      const data = JSON.parse(msg.data);
      if (data.channel && data.channel.alternatives[0]) {
        setTranscript(data.channel.alternatives[0].transcript);
        setIsAssistantTalking(!!data.channel.alternatives[0].transcript);
      }
    };

    return () => {
      ws.close();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 text-gray-700 hover:text-gray-900 text-3xl"
        aria-label="Cerrar"
      >
        ×
      </button>
      {/* SVG animado centrado */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className={`relative w-56 h-56 flex items-center justify-center`}>
          <svg
            width="220"
            height="220"
            viewBox="0 0 220 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={isAssistantTalking ? "animate-pulse-fast" : "animate-pulse-slow"}
          >
            <defs>
              <radialGradient id="grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#38bdf8" />
              </radialGradient>
            </defs>
            <circle cx="110" cy="110" r="100" fill="url(#grad)" />
          </svg>
        </div>
        <div className="mt-4 text-xl text-gray-700 text-center min-h-[2rem]">
          {transcript}
        </div>
      </div>
      {/* Botones en la parte inferior */}
      <div className="w-full flex justify-center gap-8 pb-10">
        {/* Botón micrófono */}
        <button
          className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow
            ${isAssistantTalking ? "bg-blue-100 animate-mic" : "bg-gray-100"}
          `}
          aria-label="Micrófono"
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill={isAssistantTalking ? "#38bdf8" : "none"}
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isAssistantTalking ? "animate-mic-icon" : ""}
          >
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
            <line x1="12" y1="22" x2="12" y2="18" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
        </button>
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl shadow"
          aria-label="Cerrar"
        >
          <svg width="32" height="32" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      {/* Animaciones Tailwind personalizadas */}
      <style jsx>{`
        .animate-pulse-slow {
          animation: pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-pulse-fast {
          animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1);}
          50% { opacity: 0.7; transform: scale(1.08);}
        }
        .animate-mic {
          animation: micpulse 1.2s infinite;
        }
        @keyframes micpulse {
          0%, 100% { box-shadow: 0 0 0 0 #38bdf855; }
          50% { box-shadow: 0 0 0 12px #38bdf822; }
        }
        .animate-mic-icon {
          animation: micicon 1.2s infinite;
        }
        @keyframes micicon {
          0%, 100% { transform: scale(1);}
          50% { transform: scale(1.15);}
        }
      `}</style>
    </div>
  );
};