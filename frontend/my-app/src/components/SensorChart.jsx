// src/components/SensorChart.jsx
function SensorChart({ data, metric, title, color }) {
    if (!data || data.length === 0) {
      return (
        <div className="chart-card">
          <h3>{title}</h3>
          <div className="chart-container empty">
            <p>No data available</p>
          </div>
        </div>
      );
    }
  
    // Format times for x-axis labels
    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
  
    // Get min and max values for the metric
    const values = data.map(point => point[metric]);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const latestValue = values[values.length - 1];
    const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
  
    return (
      <div className="chart-card">
        <h3>{title}</h3>
        <div className="chart-container">
          <div className="mock-chart" style={{ backgroundColor: `${color}20` }}>
            <div className="chart-stats">
              <div className="chart-stat">
                <span className="stat-label">Current:</span>
                <span className="stat-value" style={{ color }}>{latestValue.toFixed(1)}</span>
              </div>
              <div className="chart-stat">
                <span className="stat-label">Min:</span>
                <span className="stat-value">{minValue.toFixed(1)}</span>
              </div>
              <div className="chart-stat">
                <span className="stat-label">Max:</span>
                <span className="stat-value">{maxValue.toFixed(1)}</span>
              </div>
              <div className="chart-stat">
                <span className="stat-label">Avg:</span>
                <span className="stat-value">{avgValue.toFixed(1)}</span>
              </div>
            </div>
            
            <div className="chart-visual">
              <div className="chart-line" style={{ backgroundColor: color }}></div>
              {data.map((point, index) => {
                const normalizedValue = (point[metric] - minValue) / (maxValue - minValue);
                const height = Math.max(5, normalizedValue * 100);
                return (
                  <div 
                    key={index}
                    className="chart-bar"
                    style={{ 
                      height: `${height}%`, 
                      backgroundColor: color,
                      opacity: 0.7
                    }}
                    title={`${formatTime(point.timestamp)}: ${point[metric].toFixed(1)}`}
                  ></div>
                );
              })}
            </div>
            
            <div className="chart-times">
              {data.slice(0, data.length).filter((_, index) => index % Math.ceil(data.length / 6) === 0).map((point, index) => (
                <div key={index} className="chart-time">
                  {formatTime(point.timestamp)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export default SensorChart;