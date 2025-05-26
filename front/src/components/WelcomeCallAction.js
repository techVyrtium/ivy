import React, { useState } from "react";

export const WelcomeCallAction = () => {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="relative bg-[#FFFFF8] px-4 py-2 rounded-lg shadow-lg text-[#2F383F] font-medium animate-fade-in flex items-center">
      <span>Hola 👋, soy Ivy, tu asistente virtual. ¿En qué puedo ayudarte hoy? 😊</span>
      <button
        onClick={() => setShow(false)}
        className="ml-2 text-[#FF5143] hover:text-[#FF675F] text-lg font-bold focus:outline-none cursor-pointer"
        aria-label="Cerrar mensaje de bienvenida"
      >
        ×
      </button>
    </div>
  );
};
