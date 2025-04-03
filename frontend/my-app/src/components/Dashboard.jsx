import SensorChart from './SensorChart';
import SensorGauges from './SensorGauges';
import AIInsights from './AIInsights';
import SensorRoulette from './SensorRoulette';
import ChatBot from './ChatBot';
import { useState } from 'react';

function Dashboard({ sensorData, insights, activeSection, flightData }) {
    const [showChatbot, setShowChatbot] = useState(false);
  
    // Get the most recent data point
    const latestData = sensorData.length > 0 ? sensorData[sensorData.length - 1] : null;
  
    // For the main dashboard view
    if (activeSection === 'dashboard') {
      return (
        <div className="dashboard-container">
          <div className="dashboard-controls">
            <div className="control-tabs">
              <button className="control-tab active">Live Data</button>
              <button className="control-tab">Historical</button>
              <button className="control-tab">Predictions</button>
            </div>
            
            <div className="control-actions">
              <button className="control-action">
                <span className="action-icon">📥</span> Export
              </button>
              <button className="control-action">
                <span className="action-icon">🔄</span> Refresh
              </button>
              <button 
                className="control-action primary"
                onClick={() => setShowChatbot(!showChatbot)}
              >
                <span className="action-icon">💬</span> AI Assistant
              </button>
            </div>
          </div>
          
          <div className="dashboard-grid">
            <div className="main-chart-section">
              <SensorChart 
                data={sensorData} 
                metric="temperature" 
                title="Temperature Over Time" 
                color="#ef4444" 
              />
            </div>
            
            <div className="side-panel">
              <SensorGauges latestData={latestData} />
              <AIInsights insights={insights} />
            </div>
            
            <div className="bottom-panel">
              <div className="bottom-card">
                <h3>Sensor Roulette</h3>
                <SensorRoulette latestData={latestData} />
              </div>
              
              <div className="bottom-card">
                <h3>System Status</h3>
                <div className="status-grid">
                  <div className="status-item">
                    <div className="status-icon online">●</div>
                    <div className="status-label">Main Sensor</div>
                  </div>
                  <div className="status-item">
                    <div className="status-icon online">●</div>
                    <div className="status-label">Backup Sensor</div>
                  </div>
                  <div className="status-item">
                    <div className="status-icon online">●</div>
                    <div className="status-label">Data Transmission</div>
                  </div>
                  <div className="status-item">
                    <div className="status-icon warning">●</div>
                    <div className="status-label">Battery Level</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {showChatbot && (
            <div className="chatbot-overlay">
              <div className="chatbot-modal">
                <button className="close-button" onClick={() => setShowChatbot(false)}>×</button>
                <ChatBot sensorData={sensorData} flightData={flightData} />
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // For individual metric views
    const metricInfo = {
      temperature: { label: 'Temperature', unit: '°C', color: '#ef4444' },
      humidity: { label: 'Humidity', unit: '%', color: '#3b82f6' },
      pressure: { label: 'Pressure', unit: 'hPa', color: '#8b5cf6' },
      altitude: { label: 'Altitude', unit: 'm', color: '#10b981' },
      speed: { label: 'Speed', unit: 'km/h', color: '#f59e0b' }
    };
    
    // Make sure we have the metric info for the active section
    const currentMetric = metricInfo[activeSection] || { 
      label: activeSection.charAt(0).toUpperCase() + activeSection.slice(1), 
      unit: '', 
      color: '#64748b' 
    };
    
    return (
      <div className="metric-dashboard">
        <div className="metric-header">
          <h2>{currentMetric.label} Dashboard</h2>
          <div className="metric-actions">
            <button className="metric-action">
              <span className="action-icon">📥</span> Export
            </button>
            <button className="metric-action">
              <span className="action-icon">🔄</span> Refresh
            </button>
            <button 
              className="metric-action primary"
              onClick={() => setShowChatbot(!showChatbot)}
            >
              <span className="action-icon">💬</span> AI Assistant
            </button>
          </div>
        </div>
        
        <div className="metric-content">
          <div className="metric-main">
            <div className="metric-chart-card">
              <h3>{currentMetric.label} Over Time</h3>
              <SensorChart 
                data={sensorData} 
                metric={activeSection} 
                title={`${currentMetric.label} Over Time`} 
                color={currentMetric.color} 
              />
            </div>
            
            <div className="metric-stats-card">
              <h3>Statistics</h3>
              <div className="metric-stats">
                {latestData && (
                  <>
                    <div className="metric-stat">
                      <div className="stat-label">Current</div>
                      <div className="stat-value" style={{ color: currentMetric.color }}>
                        {latestData[activeSection]?.toFixed(1) || 'N/A'} {currentMetric.unit}
                      </div>
                    </div>
                    
                    <div className="metric-stat">
                      <div className="stat-label">Average</div>
                      <div className="stat-value">
                        {(sensorData.reduce((sum, point) => sum + (point[activeSection] || 0), 0) / sensorData.length).toFixed(1)} {currentMetric.unit}
                      </div>
                    </div>
                    
                    <div className="metric-stat">
                      <div className="stat-label">Min</div>
                      <div className="stat-value">
                        {Math.min(...sensorData.map(point => point[activeSection] || 0)).toFixed(1)} {currentMetric.unit}
                      </div>
                    </div>
                    
                    <div className="metric-stat">
                      <div className="stat-label">Max</div>
                      <div className="stat-value">
                        {Math.max(...sensorData.map(point => point[activeSection] || 0)).toFixed(1)} {currentMetric.unit}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="metric-sidebar">
            <div className="metric-gauge-card">
              <h3>Current Reading</h3>
              {latestData && (
                <div className="single-gauge" style={{ borderColor: currentMetric.color }}>
                  <div className="gauge-value" style={{ color: currentMetric.color }}>
                    {latestData[activeSection]?.toFixed(1) || 'N/A'}
                  </div>
                  <div className="gauge-unit">{currentMetric.unit}</div>
                  <div className="gauge-label">{currentMetric.label}</div>
                  <div className="gauge-time">
                    Last updated: {new Date(latestData.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              )}
            </div>
            
            <div className="metric-insights-card">
              <h3>AI Insights</h3>
              <AIInsights insights={insights.filter(insight => 
                insight.relatedMetrics?.includes(activeSection)
              )} />
            </div>
          </div>
        </div>
        
        {showChatbot && (
          <div className="chatbot-overlay">
            <div className="chatbot-modal">
              <button className="close-button" onClick={() => setShowChatbot(false)}>×</button>
              <ChatBot sensorData={sensorData} flightData={flightData} />
            </div>
          </div>
        )}
      </div>
    );
  }

export default Dashboard; 