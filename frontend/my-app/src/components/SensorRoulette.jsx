// src/components/SensorRoulette.jsx
function SensorRoulette({ latestData }) {
    if (!latestData) return <div>Loading...</div>;
    
    return (
      <div className="roulette-container">
        <div className="roulette-wheel">
          <div className="mock-wheel">
            <div className="wheel-value">
              {Math.round(latestData.temperature)}
            </div>
            <div className="wheel-label">Temperature Value</div>
          </div>
        </div>
        
        <div className="sensor-data-grid">
          <div className="data-section">
            <div className="section-title">Sensor Values</div>
            <div className="data-chips">
              <div className="data-chip orange">{Math.round(latestData.temperature)}</div>
              <div className="data-chip green">{Math.round(latestData.humidity)}</div>
              <div className="data-chip red">{Math.round(latestData.pressure % 100)}</div>
              <div className="data-chip green">{Math.round(latestData.altitude % 100)}</div>
              <div className="data-chip green">{Math.round(latestData.speed)}</div>
            </div>
          </div>
          
          <div className="data-footer">
            <div className="data-range">Temperature</div>
            <div className="data-range active">Humidity</div>
            <div className="data-range">Pressure</div>
            <div className="data-range">Altitude</div>
          </div>
        </div>
      </div>
    );
  }
  
  export default SensorRoulette;