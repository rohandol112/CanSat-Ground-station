import { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { setupFlightDataPolling } from '../utils/dataUtils';

function ChatBot({ sensorData, flightData }) {
  // State to track if the API key is valid
  const [aiClient, setAiClient] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your CubeSat assistant. I can help you analyze telemetry data, provide recommendations, and answer questions about your satellite. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [flightDataState, setFlightData] = useState(flightData || []);
  const messagesEndRef = useRef(null);

  // Initialize the AI client with error handling
  useEffect(() => {
    try {
      const API_KEY = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
      
      if (!API_KEY) {
        setApiError("API key is missing. Please check your environment variables.");
        return;
      }
      
      console.log("API Key available:", API_KEY ? "Yes" : "No");
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      setAiClient(ai);
    } catch (error) {
      console.error("Error initializing Google GenAI client:", error);
      setApiError("Failed to initialize AI client: " + error.message);
    }
  }, []);

  // Set up polling for flight data if not provided as prop
  useEffect(() => {
    if (!flightData) {
      const pollId = setupFlightDataPolling((data) => {
        setFlightData(data);
        console.log("Updated flight data:", data.length > 0 ? data[data.length - 1] : "No data");
      }, 3000); // Poll every 3 seconds
      
      // Clean up the interval when component unmounts
      return () => clearInterval(pollId);
    }
  }, [flightData]);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message to Google GenAI
  const sendMessageToGoogleGenAI = async (userMessage) => {
    setIsLoading(true);
    setApiError(null);
    
    if (!aiClient) {
      setApiError("AI client is not initialized. Check your API key.");
      setIsLoading(false);
      return "I'm having trouble connecting to my AI backend. Please check the API configuration.";
    }
    
    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ text: userMessage }],
      });
      
      return response.text;
    } catch (error) {
      console.error('Error calling Google GenAI:', error);
      setApiError(error.message);
      return "There was an error processing your request. " + error.message;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    // Add user message to chat
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    
    // Get response from Google GenAI
    const response = await sendMessageToGoogleGenAI(userMessage);
    
    // Add assistant response to chat
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>CubeSat AI Assistant</h3>
        <p className="chatbot-subtitle">Powered by Claude AI</p>
        {flightDataState && flightDataState.length > 0 && (
          <div className="data-status">
            <span className="status-dot active"></span>
            Live data connected
          </div>
        )}
        {apiError && (
          <div className="api-error">
            API Error: {apiError}
          </div>
        )}
      </div>
      
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`chat-message ${message.role}`}>
            <div className="chat-icon">
              {message.role === 'assistant' ? '🤖' : '👤'}
            </div>
            <div className="chat-content">
              <p>{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-message assistant">
            <div className="chat-icon">🤖</div>
            <div className="chat-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your CubeSat data..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button 
          className="send-button"
          onClick={handleSendMessage}
          disabled={isLoading || !aiClient}
        >
          {isLoading ? '...' : '↑'}
        </button>
      </div>
    </div>
  );
}

export default ChatBot;