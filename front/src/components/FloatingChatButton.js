import React from "react";

export const FloatingChatButton = ({ onClick, isOpen }) => {
  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-3 z-50">
      {!isOpen && (
        <div className="bg-white px-4 py-2 rounded-lg shadow-lg text-gray-700 font-medium animate-fade-in">
          Hola 👋, soy Ivy, tu asistente virtual. ¿En qué puedo ayudarte hoy? 😊
        </div>
      )}
      <button
        onClick={onClick}
        className={`w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${
          isOpen ? "scale-0" : "scale-100"
        }`}
        aria-label="Abrir chat"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>
    </div>
  );
};
