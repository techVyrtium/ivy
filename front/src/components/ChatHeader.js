export const ChatHeader = ({ onClose }) => {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between shadow-md">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-md">
          <span className="text-blue-600 font-bold text-lg">IV</span>
        </div>
        <div>
          <h1 className="font-bold text-lg">Ivy Assistant</h1>
          <p className="text-xs text-blue-100">Your smart virtual assistant</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
        aria-label="Cerrar chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}; 