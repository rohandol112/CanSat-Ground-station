// src/components/SensorGauges.jsx
function SensorGauges({ latestData }) {
    if (!latestData) {
      return <div className="no-data">No sensor data available</div>;
    }
  
    return (
      <div className="gauges-grid">
        <div className="gauge-item">
          <div className="gauge-chart temperature">
            <div className="gauge-value">
              <span className="value">{latestData.temperature.toFixed(1)}</span>
              <span className="unit">°C</span>
            </div>
            <div className="gauge-label">Temperature</div>
          </div>
        </div>
        
        <div className="gauge-item">
          <div className="gauge-chart humidity">
            <div className="gauge-value">
              <span className="value">{latestData.humidity.toFixed(0)}</span>
              <span className="unit">%</span>
            </div>
            <div className="gauge-label">Humidity</div>
          </div>
        </div>
        
        <div className="gauge-item">
          <div className="gauge-chart pressure">
            <div className="gauge-value">
              <span className="value">{latestData.pressure.toFixed(0)}</span>
              <span className="unit">hPa</span>
            </div>
            <div className="gauge-label">Pressure</div>
          </div>
        </div>
        
        <div className="current-readings">
          <div className="reading-item">
            <div className="reading-label">Altitude</div>
            <div className="reading-value">{latestData.altitude.toFixed(1)} m</div>
          </div>
          <div className="reading-item">
            <div className="reading-label">Speed</div>
            <div className="reading-value">{latestData.speed.toFixed(1)} km/h</div>
          </div>
          <div className="reading-item reading-time">
            <div className="reading-label">Last Updated</div>
            <div className="reading-value">{new Date(latestData.timestamp).toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    );
  }
  
  export default SensorGauges;