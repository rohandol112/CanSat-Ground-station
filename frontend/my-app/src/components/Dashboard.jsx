import React, { useEffect, useState } from 'react';
import SensorChart from './SensorChart';
import SensorGauges from './SensorGauges';
import AIInsights from './AIInsights';
import SensorRoulette from './SensorRoulette';
import ChatBot from './ChatBot';
import { setupFlightDataPolling } from '../utils/dataUtils';

function Dashboard({ insights, activeSection }) {
  const [flightData, setFlightData] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Set up polling for flight data
  useEffect(() => {
    const pollId = setupFlightDataPolling((data) => {
      setFlightData(data);
    }, 5000); // Poll every 5 seconds

    // Clean up the polling on component unmount
    return () => clearInterval(pollId);
  }, []);

  // Get the most recent data point
  const latestData = flightData.length > 0 ? flightData[flightData.length - 1] : null;

  // Map speed to one of the sensor values if it's not directly in the data
  const getFourMainMetrics = (data) => {
    if (!data) return {};
    
    return {
      temperature: data.temperature || 0,
      pressure: data.pressure || 0,
      altitude: data.altitude || 0,
      // Map speed to sensor1 if it's not directly available
      speed: data.speed || data.sensor1 || 0
    };
  };

  // Common button styles
  const buttonStyles = {
    base: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      fontWeight: '500',
    },
    tab: {
      backgroundColor: 'transparent',
      color: '#64748b',
      borderBottom: '2px solid transparent',
      borderRadius: '0',
      padding: '10px 16px',
    },
    tabActive: {
      borderBottom: '2px solid #3b82f6',
      color: '#3b82f6',
    },
    action: {
      backgroundColor: '#f1f5f9', 
      color: '#334155',
    },
    primary: {
      backgroundColor: '#3b82f6',
      color: 'white',
    }
  };

  // Card styles
  const cardStyles = {
    base: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      padding: '16px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    title: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#334155',
      marginBottom: '16px',
      paddingBottom: '8px',
      borderBottom: '1px solid #e2e8f0',
    }
  };

  // Metric card styles
  const metricCardStyles = {
    card: {
      padding: '16px',
      borderRadius: '8px',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transition: 'transform 0.2s ease',
    },
    icon: {
      fontSize: '24px',
      marginBottom: '8px',
    },
    label: {
      fontSize: '12px',
      color: '#64748b',
      marginBottom: '4px',
    },
    value: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#0f172a',
    }
  };

  // Status indicator styles
  const statusStyles = {
    item: {
      display: 'flex',
      alignItems: 'center',
      padding: '8px 0',
    },
    icon: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      marginRight: '8px',
    },
    online: {
      backgroundColor: '#10b981',
    },
    warning: {
      backgroundColor: '#f59e0b',
    },
    offline: {
      backgroundColor: '#ef4444',
    },
    label: {
      fontSize: '14px',
      color: '#334155',
    }
  };

  // For the main dashboard view
  if (activeSection === 'dashboard') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '16px',
        maxWidth: '100%',
        overflow: 'hidden',
      }}>
        {/* Dashboard Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: isMobile ? '12px' : '0',
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: isMobile ? 'auto' : 'visible',
            width: isMobile ? '100%' : 'auto',
            paddingBottom: isMobile ? '4px' : '0',
          }}>
            <button style={{...buttonStyles.base, ...buttonStyles.tab, ...buttonStyles.tabActive}}>
              Live Data
            </button>
            <button style={{...buttonStyles.base, ...buttonStyles.tab}}>
              Historical
            </button>
            <button style={{...buttonStyles.base, ...buttonStyles.tab}}>
              Predictions
            </button>
          </div>
          
          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '8px',
            width: isMobile ? '100%' : 'auto',
            justifyContent: isMobile ? 'space-between' : 'flex-end',
          }}>
            <button style={{...buttonStyles.base, ...buttonStyles.action}}>
              <span role="img" aria-label="Export">📥</span> 
              {!isMobile && "Export"}
            </button>
            <button style={{...buttonStyles.base, ...buttonStyles.action}}>
              <span role="img" aria-label="Refresh">🔄</span> 
              {!isMobile && "Refresh"}
            </button>
            <button 
              style={{...buttonStyles.base, ...buttonStyles.primary}}
              onClick={() => setShowChatbot(!showChatbot)}
            >
              <span role="img" aria-label="AI Assistant">💬</span> 
              {!isMobile && "AI Assistant"}
            </button>
          </div>
        </div>
        
        {/* Dashboard Grid */}
        <div style={{
          display: 'grid',
          gap: '20px',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
          gridTemplateRows: 'auto',
          gridTemplateAreas: isMobile ? 
            `'metrics'
             'chart'
             'gauges'
             'insights'
             'roulette'
             'status'` :
            `'metrics metrics chart chart'
             'metrics metrics chart chart'
             'roulette roulette gauges insights'
             'status status gauges insights'`,
        }}>
          {/* Main Metrics Panel */}
          <div style={{
            gridArea: 'metrics',
            ...cardStyles.base,
            padding: '16px',
          }}>
            <h3 style={cardStyles.title}>Main Metrics</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: '16px',
              flex: '1',
            }}>
              {latestData && (
                <>
                  <div style={{
                    ...metricCardStyles.card,
                    borderLeft: '4px solid #ef4444',
                  }}>
                    <div style={{...metricCardStyles.icon, color: '#ef4444'}}>🌡️</div>
                    <div style={metricCardStyles.label}>Temperature</div>
                    <div style={metricCardStyles.value}>{latestData.temperature?.toFixed(1) || 'N/A'}°C</div>
                  </div>
                  
                  <div style={{
                    ...metricCardStyles.card,
                    borderLeft: '4px solid #8b5cf6',
                  }}>
                    <div style={{...metricCardStyles.icon, color: '#8b5cf6'}}>🔄</div>
                    <div style={metricCardStyles.label}>Pressure</div>
                    <div style={metricCardStyles.value}>{latestData.pressure?.toFixed(1) || 'N/A'} hPa</div>
                  </div>
                  
                  <div style={{
                    ...metricCardStyles.card,
                    borderLeft: '4px solid #10b981',
                  }}>
                    <div style={{...metricCardStyles.icon, color: '#10b981'}}>🏔️</div>
                    <div style={metricCardStyles.label}>Altitude</div>
                    <div style={metricCardStyles.value}>{latestData.altitude?.toFixed(1) || 'N/A'} m</div>
                  </div>
                  
                  <div style={{
                    ...metricCardStyles.card,
                    borderLeft: '4px solid #f59e0b',
                    gridColumn: isMobile ? 'span 2' : 'auto',
                    width: isMobile ? '100%' : 'auto',
                    margin: isMobile ? '0 auto' : '0',
                  }}>
                    <div style={{...metricCardStyles.icon, color: '#f59e0b'}}>⚡</div>
                    <div style={metricCardStyles.label}>Speed</div>
                    <div style={metricCardStyles.value}>{(latestData.speed || latestData.sensor1)?.toFixed(1) || 'N/A'} km/h</div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Main Chart Section */}
          <div style={{
            gridArea: 'chart',
            ...cardStyles.base,
          }}>
            <h3 style={cardStyles.title}>Temperature Over Time</h3>
            <div style={{ flex: '1', position: 'relative', minHeight: '250px' }}>
              <SensorChart 
                data={flightData} 
                metric="temperature" 
                title="Temperature Over Time" 
                color="#ef4444" 
              />
            </div>
          </div>
          
          {/* Gauges Section */}
          <div style={{
            gridArea: 'gauges',
            ...cardStyles.base,
          }}>
            <h3 style={cardStyles.title}>Sensor Gauges</h3>
            <div style={{ flex: '1' }}>
              <SensorGauges latestData={latestData} />
            </div>
          </div>
          
          {/* AI Insights */}
          <div style={{
            gridArea: 'insights',
            ...cardStyles.base,
          }}>
            <h3 style={cardStyles.title}>AI Insights</h3>
            <div style={{ flex: '1', overflowY: 'auto' }}>
              <AIInsights insights={insights} />
            </div>
          </div>
          
          {/* Sensor Roulette */}
          <div style={{
            gridArea: 'roulette',
            ...cardStyles.base,
          }}>
            <h3 style={cardStyles.title}>Sensor Roulette</h3>
            <div style={{ flex: '1' }}>
              <SensorRoulette latestData={latestData} />
            </div>
          </div>
          
          {/* Status Panel */}
          <div style={{
            gridArea: 'status',
            ...cardStyles.base,
          }}>
            <h3 style={cardStyles.title}>System Status</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: '8px',
              flex: '1',
            }}>
              <div style={statusStyles.item}>
                <div style={{...statusStyles.icon, ...statusStyles.online}}></div>
                <div style={statusStyles.label}>Main Sensor</div>
              </div>
              <div style={statusStyles.item}>
                <div style={{...statusStyles.icon, ...statusStyles.online}}></div>
                <div style={statusStyles.label}>Backup Sensor</div>
              </div>
              <div style={statusStyles.item}>
                <div style={{...statusStyles.icon, ...statusStyles.online}}></div>
                <div style={statusStyles.label}>Data Transmission</div>
              </div>
              <div style={statusStyles.item}>
                <div style={{
                  ...statusStyles.icon, 
                  ...(latestData && latestData.status > 0 ? statusStyles.online : statusStyles.warning)
                }}></div>
                <div style={statusStyles.label}>Battery Level</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chatbot Overlay */}
        {showChatbot && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              width: isMobile ? '90%' : '500px',
              maxWidth: '90vw',
              maxHeight: '80vh',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <button 
                onClick={() => setShowChatbot(false)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 1,
                }}
              >
                ×
              </button>
              <div style={{ flex: 1, padding: '16px', overflow: 'hidden' }}>
                <ChatBot sensorData={flightData} flightData={flightData} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // For individual metric views - Implement similar styling approach
  const metricMapping = {
    temperature: 'temperature',
    pressure: 'pressure',
    altitude: 'altitude',
    speed: 'sensor1' // Map speed to sensor1
  };
  
  // For individual metric views
  const metricInfo = {
    temperature: { label: 'Temperature', unit: '°C', color: '#ef4444' },
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
  
  // Map the active section to the actual data property
  const dataProperty = metricMapping[activeSection] || activeSection;
  
  // For metric-specific view
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '16px',
    }}>
      {/* Metric Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        gap: isMobile ? '12px' : '0',
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: currentMetric.color,
          margin: '0',
        }}>
          {currentMetric.label} Dashboard
        </h2>
        
        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          width: isMobile ? '100%' : 'auto',
          justifyContent: isMobile ? 'space-between' : 'flex-end',
          marginTop: isMobile ? '8px' : '0',
        }}>
          <button style={{...buttonStyles.base, ...buttonStyles.action}}>
            <span role="img" aria-label="Export">📥</span> 
            {!isMobile && "Export"}
          </button>
          <button style={{...buttonStyles.base, ...buttonStyles.action}}>
            <span role="img" aria-label="Refresh">🔄</span> 
            {!isMobile && "Refresh"}
          </button>
          <button 
            style={{...buttonStyles.base, ...buttonStyles.primary}}
            onClick={() => setShowChatbot(!showChatbot)}
          >
            <span role="img" aria-label="AI Assistant">💬</span> 
            {!isMobile && "AI Assistant"}
          </button>
        </div>
      </div>
      
      {/* Metric Content */}
      <div style={{
        display: 'grid',
        gap: '20px',
        gridTemplateColumns: isMobile ? '1fr' : '3fr 1fr',
      }}>
        {/* Main Content */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          {/* Chart */}
          <div style={{
            ...cardStyles.base,
            minHeight: '300px',
          }}>
            <h3 style={{...cardStyles.title, color: currentMetric.color}}>
              {currentMetric.label} Over Time
            </h3>
            <div style={{ flex: '1', position: 'relative', minHeight: '250px' }}>
              <SensorChart 
                data={flightData} 
                metric={dataProperty}
                title={`${currentMetric.label} Over Time`} 
                color={currentMetric.color} 
              />
            </div>
          </div>
          
          {/* Statistics */}
          <div style={cardStyles.base}>
            <h3 style={{...cardStyles.title, color: currentMetric.color}}>Statistics</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: '16px',
            }}>
              {latestData && (
                <>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}>
                    <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>
                      Current
                    </div>
                    <div style={{ 
                      color: currentMetric.color, 
                      fontSize: '18px', 
                      fontWeight: '600' 
                    }}>
                      {latestData[dataProperty]?.toFixed(1) || 'N/A'} {currentMetric.unit}
                    </div>
                  </div>
                  
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}>
                    <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>
                      Average
                    </div>
                    <div style={{ 
                      color: '#334155', 
                      fontSize: '18px', 
                      fontWeight: '600' 
                    }}>
                      {(flightData.reduce((sum, point) => sum + (point[dataProperty] || 0), 0) / 
                        (flightData.length || 1)).toFixed(1)} {currentMetric.unit}
                    </div>
                  </div>
                  
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}>
                    <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>
                      Min
                    </div>
                    <div style={{ 
                      color: '#334155', 
                      fontSize: '18px', 
                      fontWeight: '600' 
                    }}>
                      {Math.min(...flightData.map(point => point[dataProperty] || 0)).toFixed(1)} {currentMetric.unit}
                    </div>
                  </div>
                  
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}>
                    <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>
                      Max
                    </div>
                    <div style={{ 
                      color: '#334155', 
                      fontSize: '18px', 
                      fontWeight: '600' 
                    }}>
                      {Math.max(...flightData.map(point => point[dataProperty] || 0)).toFixed(1)} {currentMetric.unit}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          {/* Current Reading Gauge */}
          <div style={cardStyles.base}>
            <h3 style={{...cardStyles.title, color: currentMetric.color}}>Current Reading</h3>
            {latestData && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                border: `2px solid ${currentMetric.color}`,
                borderRadius: '8px',
                flex: '1',
              }}>
                <div style={{ 
                  color: currentMetric.color, 
                  fontSize: '32px', 
                  fontWeight: '700' 
                }}>
                  {latestData[dataProperty]?.toFixed(1) || 'N/A'}
                </div>
                <div style={{ color: '#64748b', fontSize: '16px' }}>
                  {currentMetric.unit}
                </div>
                <div style={{ 
                  color: '#334155', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  marginTop: '12px' 
                }}>
                  {currentMetric.label}
                </div>
                <div style={{ 
                  color: '#64748b', 
                  fontSize: '12px',
                  marginTop: '8px' 
                }}>
                  Last updated: {latestData && new Date(latestData.timestamp).toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
          
          {/* AI Insights */}
          <div style={{
            ...cardStyles.base,
            flex: '1',
            overflowY: 'auto',
          }}>
            <h3 style={{...cardStyles.title, color: currentMetric.color}}>AI Insights</h3>
            <div style={{ flex: '1' }}>
              <AIInsights insights={insights.filter(insight => 
                insight.relatedMetrics?.includes(activeSection) || 
                insight.relatedMetrics?.includes(dataProperty)
              )} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Chatbot Overlay */}
      {showChatbot && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            width: isMobile ? '90%' : '500px',
            maxWidth: '90vw',
            maxHeight: '80vh',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <button 
              onClick={() => setShowChatbot(false)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1,
              }}
            >
              ×
            </button>
            <div style={{ flex: 1, padding: '16px', overflow: 'hidden' }}>
              <ChatBot sensorData={flightData} flightData={flightData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;