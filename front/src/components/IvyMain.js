"use client";
import { useRef, useEffect, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatMessages } from "@/components/ChatMessages";
import { ChatInput } from "@/components/ChatInput";
import { ChatHeader } from "@/components/ChatHeader";
import { ProcessingStatus } from "@/components/ProcessingStatus";
import { CallModal } from "@/components/CallModal";
import { PolicyCheckBox } from "@/components/PolicyCheckBox";
import { FloatingChatButton } from "@/components/FloatingChatButton";
import { getConversation } from "@/services/chatService";

export default function ChatPage() {
  const {
    inputValue,
    setInputValue,
    messages,
    sendMessage,
    isLoading,
    processingStatus,
    updateProcessingStatus,
    isAudioPlaying,
    audioMessageIdx,
    pauseAudio,
    playAssistantAudio,
    loadingAudioIdx,
    setMessages,
  } = useChat();
  const chatRef = useRef();
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isAcceptedPolicy, setIsAcceptedPrivacy] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Client-side mounting detection
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Data fetching effect
  useEffect(() => {
    if (!isMounted) return;

    const fetchData = async () => {
      try {
        const safeMessages = await getConversation(0);
        setMessages([...messages, ...safeMessages]);
      } catch (error) {
        console.error("Error fetching conversation:", error);
        setMessages([...messages]);
      }
    };

    fetchData();
  }, [isMounted, setMessages]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Efecto para detectar acciones específicas en los mensajes
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user") {
        const messageContent = lastMessage.content.toLowerCase();

        if (
          messageContent.includes("convert") ||
          messageContent.includes("currency")
        ) {
          updateProcessingStatus("converting");
        } else if (
          messageContent.includes("analyze") ||
          messageContent.includes("data")
        ) {
          updateProcessingStatus("analyzing");
        } else if (
          messageContent.includes("trigger") ||
          messageContent.includes("create")
        ) {
          updateProcessingStatus("generating");
        } else {
          updateProcessingStatus("processing");
        }
      }
    }
  }, [messages, updateProcessingStatus]);

  // checking if the user already accepted privacy policy or not
  useEffect(() => {
    const isPolicyAccepted = sessionStorage.getItem("ivy-policy");

    if (isPolicyAccepted && isPolicyAccepted === "accepted") {
      setIsAcceptedPrivacy(true);
    } else {
      setIsAcceptedPrivacy(false);
    }
  });

  // Efecto para escuchar la tecla Escape
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isChatOpen) {
        setIsChatOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscapeKey);
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isChatOpen]);

  return (
    <>
      <FloatingChatButton 
        onClick={() => setIsChatOpen(!isChatOpen)} 
        isOpen={isChatOpen} 
      />
      
      <div className={`fixed bottom-24 right-6 w-full max-w-md h-[80vh] flex flex-col bg-white rounded-lg 
      shadow-xl overflow-hidden transition-all duration-300 transform ${
        isChatOpen ? 'translate-y-0 opacity-100 ' : 'translate-y-full opacity-0 mt-2'
      }`}>
        <ChatHeader onClose={() => setIsChatOpen(false)} />
        <div className="flex-1 overflow-y-auto" ref={chatRef}>
          <ChatMessages
            messages={messages}
            isAudioPlaying={isAudioPlaying}
            audioMessageIdx={audioMessageIdx}
            pauseAudio={pauseAudio}
            playAssistantAudio={playAssistantAudio}
            loadingAudioIdx={loadingAudioIdx}
          />
          {isLoading && <ProcessingStatus status={processingStatus} />}
        </div>
        <div className="relative p-4 border-t border-gray-200">
          <ChatInput
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSendMessage={sendMessage}
            isProcessing={isLoading}
            pauseAudio={pauseAudio}
            onOpenCallModal={() => setIsCallModalOpen(true)}
          />

          {isAcceptedPolicy || (
            <PolicyCheckBox
              payload={{ isAcceptedPolicy, setIsAcceptedPrivacy }}
            />
          )}
        </div>
        {isCallModalOpen && (
          <CallModal
            isOpen={isCallModalOpen}
            onClose={() => setIsCallModalOpen(false)}
          />
        )}
      </div>
    </>
  );
}
