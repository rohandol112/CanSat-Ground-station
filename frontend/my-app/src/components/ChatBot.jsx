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
  const [lastAlertTimestamp, setLastAlertTimestamp] = useState(0);
  const [anomalyDetection, setAnomalyDetection] = useState(false); // Disabled by default
  const [lastAlertValues, setLastAlertValues] = useState({}); // Keep track of last values that triggered alerts
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
    let pollId;
    
    if (!flightData) {
      pollId = setupFlightDataPolling((data) => {
        // Only update state and check anomalies if data actually changed
        if (data.length > 0) {
          // Check if this is new data before processing
          const lastData = flightDataState.length > 0 ? flightDataState[flightDataState.length - 1] : null;
          const newData = data[data.length - 1];
          
          // Only update and check if we have new data (different timestamp or ID)
          if (!lastData || newData.timestamp !== lastData.timestamp || newData.id !== lastData.id) {
            setFlightData(data);
            
            // Only check for anomalies if enabled
            if (anomalyDetection) {
              checkForAnomalies(newData);
            }
            
            console.log("Updated flight data:", newData);
          }
        }
      }, 3000); // Poll every 3 seconds
    }
    
    // Clean up the interval when component unmounts
    return () => {
      if (pollId) clearInterval(pollId);
    };
  }, [flightData, anomalyDetection, flightDataState]);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to check for anomalies in the telemetry data
  const checkForAnomalies = (data) => {
    // Don't alert too frequently - minimum 60 second intervals
    const now = Date.now();
    if (now - lastAlertTimestamp < 60000) return;
    
    const anomalies = [];
    let shouldAlert = false;
    
    // Check temperature (only alert if value changed significantly since last alert)
    if (data.temperature > 45 && 
        (!lastAlertValues.temperature || Math.abs(data.temperature - lastAlertValues.temperature) > 2)) {
      anomalies.push(`⚠️ HIGH TEMPERATURE ALERT: ${data.temperature}°C exceeds safe operating range`);
      shouldAlert = true;
      lastAlertValues.temperature = data.temperature;
    } else if (data.temperature < -15 && 
              (!lastAlertValues.temperature || Math.abs(data.temperature - lastAlertValues.temperature) > 2)) {
      anomalies.push(`⚠️ LOW TEMPERATURE ALERT: ${data.temperature}°C below safe operating range`);
      shouldAlert = true; 
      lastAlertValues.temperature = data.temperature;
    }
    
    // Check pressure
    if (data.pressure > 110 &&
        (!lastAlertValues.pressure || Math.abs(data.pressure - lastAlertValues.pressure) > 3)) {
      anomalies.push(`⚠️ HIGH PRESSURE ALERT: ${data.pressure} kPa exceeds expected range`);
      shouldAlert = true;
      lastAlertValues.pressure = data.pressure;
    } else if (data.pressure < 90 && data.altitude < 200 &&
              (!lastAlertValues.pressure || Math.abs(data.pressure - lastAlertValues.pressure) > 3)) {
      anomalies.push(`⚠️ LOW PRESSURE ALERT: ${data.pressure} kPa below expected range for current altitude`);
      shouldAlert = true;
      lastAlertValues.pressure = data.pressure;
    }
    
    // Check status code - only alert on changes to critical status
    if (data.status === 3 && lastAlertValues.status !== 3) {
      anomalies.push(`🚨 CRITICAL STATUS ALERT: Satellite reporting critical status code`);
      shouldAlert = true;
      lastAlertValues.status = data.status;
    } else if (data.status === 2 && lastAlertValues.status !== 2 && lastAlertValues.status !== 3) {
      anomalies.push(`⚠️ WARNING STATUS: Satellite reporting warning status code`);
      shouldAlert = true;
      lastAlertValues.status = data.status;
    } else if ((data.status === 0 || data.status === 1) && (lastAlertValues.status === 2 || lastAlertValues.status === 3)) {
      // Status recovered from warning/critical
      anomalies.push(`✅ STATUS RECOVERED: Satellite status returned to normal (${data.status === 0 ? 'Standby' : 'Operational'})`);
      shouldAlert = true;
      lastAlertValues.status = data.status;
    }
    
    // Check sensor readings for anomalies (looking for outliers)
    // Only run this check occasionally to avoid too many alerts
    if (now - lastAlertTimestamp > 300000) { // Every 5 minutes at most
      const sensorValues = [data.sensor1, data.sensor2, data.sensor3, data.sensor4, data.sensor5, data.sensor6];
      const avg = sensorValues.reduce((sum, val) => sum + val, 0) / sensorValues.length;
      const stdDev = Math.sqrt(sensorValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / sensorValues.length);
      
      // Only check for extreme outliers (3+ standard deviations)
      sensorValues.forEach((value, index) => {
        if (Math.abs(value - avg) > 3 * stdDev) {
          anomalies.push(`⚠️ SENSOR ${index + 1} ANOMALY: Reading of ${value} is significantly outside expected range`);
          shouldAlert = true;
        }
      });
    }
    
    // If anomalies detected and we should alert, add message and update timestamp
    if (anomalies.length > 0 && shouldAlert) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Anomaly detection system alert:\n${anomalies.join('\n')}` 
      }]);
      setLastAlertTimestamp(now);
      setLastAlertValues({...lastAlertValues}); // Update the stored values
    }
  };

  // Enhanced prompt for the AI with context about CubeSat data
  const buildAIPrompt = (userMessage) => {
    let prompt = `You are a specialized CubeSat assistant. Your role is to help the operator monitor and analyze satellite telemetry data.

Context about the current CubeSat status:`;
    
    // Add latest telemetry data if available
    if (flightDataState && flightDataState.length > 0) {
      const latest = flightDataState[flightDataState.length - 1];
      prompt += `
- Current altitude: ${latest.altitude} km
- Temperature: ${latest.temperature}°C
- Pressure: ${latest.pressure} kPa
- Status code: ${latest.status} (0=Standby, 1=Operational, 2=Warning, 3=Critical, 4=Maintenance)
- Sensor readings: [${latest.sensor1}, ${latest.sensor2}, ${latest.sensor3}, ${latest.sensor4}, ${latest.sensor5}, ${latest.sensor6}]
- Timestamp: ${new Date(latest.timestamp).toLocaleString()}`;
    } else {
      prompt += " No current telemetry data available.";
    }
    
    prompt += `\n\nThe user is asking: ${userMessage}\n\nProvide a helpful, concise response focused on satellite operations. If they're asking about data analysis, give insights about the telemetry values. If they ask for recommendations, consider optimal satellite operation parameters.`;
    
    return prompt;
  };

  // Send message to Google GenAI with enhanced prompt
  const sendMessageToGoogleGenAI = async (userMessage) => {
    setIsLoading(true);
    setApiError(null);
    
    if (!aiClient) {
      setApiError("AI client is not initialized. Check your API key.");
      setIsLoading(false);
      return "I'm having trouble connecting to my AI backend. Please check the API configuration.";
    }
    
    try {
      const enhancedPrompt = buildAIPrompt(userMessage);
      
      const response = await aiClient.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ text: enhancedPrompt }],
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

  // Handle special commands for quick data access
  const handleSpecialCommands = (userInput) => {
    const input = userInput.toLowerCase().trim();
    
    // If no flight data available, can't process commands
    if (!flightDataState || flightDataState.length === 0) {
      return null;
    }
    
    const latest = flightDataState[flightDataState.length - 1];
    
    // Handle quick commands
    if (input === "/status") {
      const statusMap = {0: "Standby", 1: "Operational", 2: "Warning", 3: "Critical", 4: "Maintenance"};
      return `CubeSat Status: ${statusMap[latest.status] || "Unknown"} (Code: ${latest.status})`;
    } else if (input === "/temp") {
      return `Temperature: ${latest.temperature}°C`;
    } else if (input === "/altitude") {
      return `Altitude: ${latest.altitude} km`;
    } else if (input === "/pressure") {
      return `Pressure: ${latest.pressure} kPa`;
    } else if (input === "/sensors") {
      return `Sensor readings:\n- Sensor 1: ${latest.sensor1}\n- Sensor 2: ${latest.sensor2}\n- Sensor 3: ${latest.sensor3}\n- Sensor 4: ${latest.sensor4}\n- Sensor 5: ${latest.sensor5}\n- Sensor 6: ${latest.sensor6}`;
    } else if (input === "/summary") {
      return `CubeSat Summary:\n- Status: ${latest.status} (${latest.status === 1 ? "Operational" : latest.status === 0 ? "Standby" : latest.status === 2 ? "Warning" : latest.status === 3 ? "Critical" : "Maintenance"})\n- Altitude: ${latest.altitude} km\n- Temperature: ${latest.temperature}°C\n- Pressure: ${latest.pressure} kPa\n- Last updated: ${new Date(latest.timestamp).toLocaleString()}`;
    } else if (input === "/help") {
      return `Available commands:\n/status - Current satellite status\n/temp - Current temperature\n/altitude - Current altitude\n/pressure - Current pressure\n/sensors - All sensor readings\n/summary - Full status summary\n/alerts on - Enable anomaly alerts\n/alerts off - Disable anomaly alerts`;
    } else if (input === "/alerts on") {
      setAnomalyDetection(true);
      return "Anomaly detection system enabled. You'll receive alerts when significant anomalies are detected.";
    } else if (input === "/alerts off") {
      setAnomalyDetection(false);
      return "Anomaly detection system disabled. No automatic alerts will be shown.";
    }
    
    return null; // Not a special command
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    // Add user message to chat
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    
    // Check for special commands first
    const specialResponse = handleSpecialCommands(userMessage);
    if (specialResponse) {
      setMessages(prev => [...prev, { role: 'assistant', content: specialResponse }]);
      return;
    }
    
    // Get response from Google GenAI
    const response = await sendMessageToGoogleGenAI(userMessage);
    
    // Add assistant response to chat
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>CubeSat AI Assistant</h3>
        <p className="chatbot-subtitle">Powered by Vyom Voyage</p>
        {flightDataState && flightDataState.length > 0 && (
          <div className="data-status">
            <span className="status-dot active"></span>
            Live data connected
            {flightDataState.length > 0 && (
              <span className="data-timestamp">
                Last update: {new Date(flightDataState[flightDataState.length - 1].timestamp).toLocaleTimeString()}
              </span>
            )}
            <div className="anomaly-status">
              Anomaly Detection: {anomalyDetection ? "Enabled" : "Disabled"}
            </div>
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
              {message.role === 'assistant' ? '🛰️' : '👨‍🚀'}
            </div>
            <div className="chat-content">
              <p>{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-message assistant">
            <div className="chat-icon">🛰️</div>
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
          placeholder="Ask about your CubeSat data or type /help for commands..."
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