import { useState, useRef, useEffect } from 'react';
import { readFlightData, setupFlightDataPolling } from '../utils/dataUtils';

// Use import.meta.env instead of process.env for Vite
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function ChatBot({ sensorData }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your CubeSat assistant. I can help you analyze telemetry data, provide recommendations, and answer questions about your satellite. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [flightData, setFlightData] = useState([]);
  const [apiError, setApiError] = useState(null);
  const messagesEndRef = useRef(null);

  // Set up polling for flight data
  useEffect(() => {
    const pollId = setupFlightDataPolling((data) => {
      setFlightData(data);
      console.log("Updated flight data:", data.length > 0 ? data[data.length - 1] : "No data");
    }, 3000); // Poll every 3 seconds
    
    // Clean up the interval when component unmounts
    return () => clearInterval(pollId);
  }, []);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message to Gemini API
  const sendMessageToGemini = async (userMessage) => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      // Prepare context with flight data
      let flightDataContext = "Here is the most recent CubeSat flight data:\n";
      
      // Add the most recent 5 entries from flight data
      const recentData = flightData.slice(-5);
      if (recentData.length > 0) {
        flightDataContext += "id, altitude, status, temperature, pressure, sensor1, sensor2, sensor3, sensor4, sensor5, sensor6, timestamp\n";
        
        recentData.forEach(entry => {
          flightDataContext += `${entry.id}, ${entry.altitude}, ${entry.status}, ${entry.temperature || entry.temprature}, ${entry.pressure}, ${entry.sensor1}, ${entry.sensor2}, ${entry.sensor3}, ${entry.sensor4 || 0}, ${entry.sensor5 || 0}, ${entry.sensor6 || 0}, ${new Date(entry.timestamp).toISOString()}\n`;
        });
        
        // Add a summary of the latest data point
        const latestData = recentData[recentData.length - 1];
        flightDataContext += "\nLatest data summary:\n";
        flightDataContext += `ID: ${latestData.id}\n`;
        flightDataContext += `Altitude: ${latestData.altitude} meters\n`;
        flightDataContext += `Status: ${latestData.status === 1 ? 'Active' : 'Inactive'}\n`;
        flightDataContext += `Temperature: ${latestData.temperature || latestData.temprature}°C\n`;
        flightDataContext += `Pressure: ${latestData.pressure} hPa\n`;
        flightDataContext += `Sensor readings: ${latestData.sensor1}, ${latestData.sensor2}, ${latestData.sensor3}, ${latestData.sensor4 || 0}, ${latestData.sensor5 || 0}, ${latestData.sensor6 || 0}\n`;
        flightDataContext += `Timestamp: ${new Date(latestData.timestamp).toLocaleString()}\n`;
      } else if (sensorData && sensorData.length > 0) {
        // Fallback to sensor data if flight data isn't available
        flightDataContext += "Using sensor data instead:\n";
        const latestSensor = sensorData[sensorData.length - 1];
        flightDataContext += `Temperature: ${latestSensor.temperature}°C, Humidity: ${latestSensor.humidity}%, Pressure: ${latestSensor.pressure} hPa, Altitude: ${latestSensor.altitude} m, Speed: ${latestSensor.speed} km/h\n`;
      } else {
        flightDataContext += "No flight data available at the moment.\n";
      }
      
      // Create the prompt with context
      const prompt = `
You are a CubeSat assistant that helps analyze satellite telemetry data and provides recommendations.

${flightDataContext}

Based on this data, please respond to the following question or request:
"${userMessage}"

If the question is about specific telemetry values, use the data provided. If asked about recommendations or precautions, provide specific advice based on the data values. If the data shows any concerning values, highlight them and suggest actions.

Keep your response concise and focused on the CubeSat data. If you notice any anomalies or trends in the data, mention them even if not specifically asked.
`;

      console.log("Sending request to Gemini API with prompt:", prompt);
      
      // Use the correct API endpoint format
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        })
      });
      
      if (!response.ok) {
        let errorText = "";
        try {
          const errorData = await response.json();
          errorText = JSON.stringify(errorData);
          console.error("API Error JSON:", errorData);
        } catch (e) {
          errorText = await response.text();
          console.error("API Error Text:", errorText);
        }
        
        console.error("API Error:", response.status, errorText);
        setApiError(`API Error (${response.status}): ${errorText}`);
        
        // Fallback to local response when API fails
        return generateLocalResponse(userMessage, flightData, sensorData);
      }

      const data = await response.json();
      console.log("API Response:", data);
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.error('Unexpected API response structure:', data);
        setApiError("Unexpected API response structure");
        
        // Fallback to local response when API response is unexpected
        return generateLocalResponse(userMessage, flightData, sensorData);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setApiError(error.message);
      
      // Fallback to local response when there's an error
      return generateLocalResponse(userMessage, flightData, sensorData);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate local responses when API is unavailable
  const generateLocalResponse = (userMessage, flightData, sensorData) => {
    const query = userMessage.toLowerCase();
    let latestData = null;
    
    // Get the latest data
    if (flightData && flightData.length > 0) {
      latestData = flightData[flightData.length - 1];
    } else if (sensorData && sensorData.length > 0) {
      latestData = sensorData[sensorData.length - 1];
    }
    
    // Common responses based on keywords
    if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
      return "Hello! I'm your CubeSat assistant. I'm currently operating in offline mode, but I can still help with basic information about your sensor data.";
    }
    
    if (query.includes('temperature') || query.includes('hot') || query.includes('cold')) {
      if (latestData) {
        const temp = latestData.temperature || latestData.temprature;
        return `The current temperature reading is ${temp.toFixed(1)}°C. In a real CubeSat, temperature management is critical as satellites experience extreme temperature variations in orbit, from very hot in direct sunlight to extremely cold in Earth's shadow.`;
      }
      return "Temperature management is critical for CubeSats. In space, satellites can experience temperatures from -150°C in Earth's shadow to +150°C in direct sunlight.";
    }
    
    if (query.includes('pressure')) {
      if (latestData) {
        return `The current pressure reading is ${latestData.pressure.toFixed(1)} hPa. In space, CubeSats operate in a vacuum, so pressure sensors are typically used to monitor internal compartments or as part of scientific experiments.`;
      }
      return "In space, CubeSats operate in a vacuum. Pressure sensors on satellites are typically used to monitor sealed compartments or as part of scientific payloads.";
    }
    
    if (query.includes('altitude') || query.includes('height')) {
      if (latestData) {
        return `The current altitude reading is ${latestData.altitude.toFixed(1)} meters. Real CubeSats typically orbit at altitudes between 400-600 km in Low Earth Orbit (LEO).`;
      }
      return "CubeSats typically operate in Low Earth Orbit (LEO), at altitudes between 400-600 km above Earth's surface.";
    }
    
    if (query.includes('status') || query.includes('health') || query.includes('condition')) {
      if (latestData) {
        const status = latestData.status === 1 ? "normal" : "alert";
        return `The current system status is: ${status}. CubeSats have various health monitoring systems to ensure all subsystems are functioning properly.`;
      }
      return "CubeSats have health monitoring systems that track power levels, temperatures, orientation, and subsystem functionality to ensure mission success.";
    }
    
    if (query.includes('sensor')) {
      if (latestData) {
        return `Current sensor readings: Sensor1: ${latestData.sensor1.toFixed(2)}, Sensor2: ${latestData.sensor2.toFixed(2)}, Sensor3: ${latestData.sensor3.toFixed(2)}. CubeSats often carry multiple sensors for redundancy and to gather different types of data.`;
      }
      return "CubeSats typically carry multiple sensors for different measurements, including star trackers for orientation, magnetometers, temperature sensors, and mission-specific scientific instruments.";
    }
    
    if (query.includes('cubesat') || query.includes('satellite')) {
      return "CubeSats are miniaturized satellites made up of multiples of 10×10×10 cm cubic units. They're popular in educational settings and for low-cost space missions due to their standardized size and relatively low development costs.";
    }
    
    if (query.includes('orbit') || query.includes('orbital')) {
      return "Most CubeSats operate in Low Earth Orbit (LEO), between 400-600 km altitude. They typically complete an orbit around Earth every 90-100 minutes, traveling at approximately 7.8 km/s.";
    }
    
    if (query.includes('power') || query.includes('battery') || query.includes('solar')) {
      return "CubeSats typically use solar panels for power generation and batteries for energy storage when in Earth's shadow. Power management is one of the most critical subsystems for mission success.";
    }
    
    // Default response for any other query
    return "I'm currently operating in offline mode with limited capabilities. I can provide basic information about CubeSats and interpret simple sensor data. For this classroom demonstration, we're simulating a CubeSat monitoring environment with local sensors.";
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    // Add user message to chat
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    
    // Get response from Gemini
    const response = await sendMessageToGemini(userMessage);
    
    // Add assistant response to chat
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>CubeSat AI Assistant</h3>
        <p className="chatbot-subtitle">Powered by Gemini API</p>
        {flightData.length > 0 && (
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
          disabled={isLoading}
        >
          {isLoading ? '...' : '↑'}
        </button>
      </div>
    </div>
  );
}

export default ChatBot;