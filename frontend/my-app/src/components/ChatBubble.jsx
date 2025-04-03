import { useState } from 'react';
import ChatBot from './ChatBot';

function ChatBubble({ sensorData }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="chat-bubble" onClick={() => setIsOpen(true)}>
        <div className="chat-bubble-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="chatbot-overlay">
          <div className="chatbot-modal">
            <button className="close-button" onClick={() => setIsOpen(false)}>×</button>
            <ChatBot sensorData={sensorData} />
          </div>
        </div>
      )}
    </>
  );
}

export default ChatBubble; 