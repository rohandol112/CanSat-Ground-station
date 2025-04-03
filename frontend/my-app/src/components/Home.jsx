import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBot from './ChatBot';
import ChatBubble from './ChatBubble';

function Home({ sensorData }) {
  const navigate = useNavigate();
  const [showChatbot, setShowChatbot] = useState(false);
  
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to CubeSat Monitor<span className="accent-dot">.</span></h1>
        <p className="hero-subtitle">Real-time satellite monitoring and analytics platform</p>
        
        <div className="hero-cta">
          <button 
            className="cta-button primary"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </button>
          <button 
            className="cta-button secondary"
            onClick={() => setShowChatbot(true)}
          >
            <span className="button-icon">🤖</span> Ask AI Assistant
          </button>
        </div>
      </div>
      
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Real-time Monitoring</h3>
          <p>Track all your CubeSat data in real-time with millisecond precision and instant alerts.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">🤖</div>
          <h3>AI-Powered Insights</h3>
          <p>Our advanced AI algorithms analyze your satellite data to provide actionable insights and predictions.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">📱</div>
          <h3>Cross-platform Access</h3>
          <p>Monitor your CubeSat from anywhere using our web, mobile, and desktop applications.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Enterprise Security</h3>
          <p>Bank-level encryption and security protocols to keep your satellite data safe.</p>
        </div>
      </div>
      
      <div className="chatbot-preview">
        <h2>AI Assistant</h2>
        <p>Our integrated AI assistant powered by Gemini API helps you understand your CubeSat data, provides recommendations, and alerts you to potential issues.</p>
        <div className="chatbot-demo">
          <div className="chat-message ai">
            <div className="chat-icon">🤖</div>
            <div className="chat-content">
              <p>I've analyzed your CubeSat telemetry and noticed the temperature readings are approaching the upper threshold. Consider adjusting the orientation to reduce solar exposure.</p>
            </div>
          </div>
          <div className="chat-message user">
            <div className="chat-icon">👤</div>
            <div className="chat-content">
              <p>What are the optimal temperature ranges for our CubeSat model?</p>
            </div>
          </div>
          <div className="chat-message ai">
            <div className="chat-icon">🤖</div>
            <div className="chat-content">
              <p>For your CubeSat model, the optimal operating temperature range is -20°C to +50°C. Current readings show 47.8°C, which is within range but approaching the upper limit.</p>
            </div>
          </div>
        </div>
        <button 
          className="cta-button secondary"
          onClick={() => setShowChatbot(true)}
        >
          Try the AI Assistant
        </button>
      </div>
      
      <div className="cta-section">
        <h2>Ready to monitor your CubeSat?</h2>
        <p>Join space agencies and research institutions using our platform to monitor their satellites.</p>
        <button 
          className="cta-button primary large"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </button>
      </div>
      
      {showChatbot && (
        <div className="chatbot-overlay">
          <div className="chatbot-modal">
            <button className="close-button" onClick={() => setShowChatbot(false)}>×</button>
            <ChatBot sensorData={sensorData} />
          </div>
        </div>
      )}
      
      <ChatBubble sensorData={sensorData} />
    </div>
  );
}

export default Home;
