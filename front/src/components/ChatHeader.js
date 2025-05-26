export const ChatHeader = ({ onClose }) => {
  return (
    <div className="bg-gradient-to-r from-[#FF5143] to-[#FF675F] text-[#FFFECE] p-4 flex items-center justify-between shadow-md">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-[#FFFFF8] flex items-center justify-center mr-3 shadow-md">
          <span className="text-[#FF5143] font-bold text-lg">IV</span>
        </div>
        <div>
          <h1 className="font-bold text-lg text-[#FFFFF8]">IVY Asistente</h1>
          <p className="text-xs text-[#FFFFF8]">Tu asistente virtual inteligente.</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-full bg-[#FFFECE]/20 hover:bg-[#FFFECE]/30 transition-colors flex items-center justify-center"
        aria-label="Cerrar chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}; 