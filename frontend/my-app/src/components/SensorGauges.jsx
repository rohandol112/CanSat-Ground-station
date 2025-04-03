// src/components/SensorGauges.jsx
import React from 'react';

function SensorGauges({ latestData }) {
  if (!latestData) {
    return <div className="text-center p-4 text-gray-400">No sensor data available</div>;
  }
  
  // Gauge styles for dark theme
  const gaugeStyles = {
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      height: '100%',
      overflow: 'auto'
    },
    gauge: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: '#1e293b', // Dark blue background
      borderRadius: '8px',
      padding: '12px 8px',
      position: 'relative',
      overflow: 'hidden'
    },
    readingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      marginBottom: '8px'
    },
    value: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#f8fafc', // Light text for dark theme
      textAlign: 'center'
    },
    unit: {
      fontSize: '12px',
      color: '#94a3b8', // Subdued text in dark theme
      marginTop: '2px'
    },
    label: {
      fontSize: '14px',
      color: '#cbd5e1', // Medium light text for dark theme
      fontWeight: '500',
      textAlign: 'center'
    },
    statusBar: {
      height: '4px',
      width: '100%',
      backgroundColor: '#334155', // Dark gray background
      position: 'absolute',
      bottom: '0',
      left: '0'
    },
    statusIndicator: {
      height: '100%',
      transition: 'width 0.5s ease'
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginTop: '12px',
      padding: '8px',
      backgroundColor: '#1e293b', // Dark blue background
      borderRadius: '6px',
      color: '#cbd5e1' // Medium light text
    },
    infoLabel: {
      fontSize: '14px',
      color: '#94a3b8' // Subdued text
    },
    infoValue: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#f8fafc' // Light text
    }
  };

  // Define gauge colors and ranges
  const gaugeConfig = {
    temperature: {
      color: '#ef4444', // Red
      min: -10,
      max: 40
    },
    humidity: {
      color: '#3b82f6', // Blue
      min: 0,
      max: 100
    },
    pressure: {
      color: '#8b5cf6', // Purple
      min: 900,
      max: 1100
    },
    altitude: {
      color: '#10b981', // Green
      min: 0,
      max: 1000
    },
    speed: {
      color: '#f59e0b', // Orange
      min: 0,
      max: 150
    }
  };

  // Calculate percentage for status bars
  const calculatePercentage = (value, min, max) => {
    const percentage = ((value - min) / (max - min)) * 100;
    return Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100
  };

  return (
    <div style={gaugeStyles.container}>
      {/* Temperature Gauge */}
      <div style={gaugeStyles.gauge}>
        <div style={gaugeStyles.readingContainer}>
          <div style={gaugeStyles.value}>
            {latestData.temperature?.toFixed(1) || 'N/A'}
          </div>
          <div style={gaugeStyles.unit}>°C</div>
        </div>
        <div style={gaugeStyles.label}>Temperature</div>
        <div style={gaugeStyles.statusBar}>
          <div 
            style={{
              ...gaugeStyles.statusIndicator,
              width: `${calculatePercentage(
                latestData.temperature || 0,
                gaugeConfig.temperature.min,
                gaugeConfig.temperature.max
              )}%`,
              backgroundColor: gaugeConfig.temperature.color
            }}
          />
        </div>
      </div>

      {/* Humidity Gauge */}
      <div style={gaugeStyles.gauge}>
        <div style={gaugeStyles.readingContainer}>
          <div style={gaugeStyles.value}>
            {latestData.humidity?.toFixed(0) || 'N/A'}
          </div>
          <div style={gaugeStyles.unit}>%</div>
        </div>
        <div style={gaugeStyles.label}>Humidity</div>
        <div style={gaugeStyles.statusBar}>
          <div 
            style={{
              ...gaugeStyles.statusIndicator,
              width: `${calculatePercentage(
                latestData.humidity || 0,
                gaugeConfig.humidity.min,
                gaugeConfig.humidity.max
              )}%`,
              backgroundColor: gaugeConfig.humidity.color
            }}
          />
        </div>
      </div>

      {/* Pressure Gauge */}
      <div style={gaugeStyles.gauge}>
        <div style={gaugeStyles.readingContainer}>
          <div style={gaugeStyles.value}>
            {latestData.pressure?.toFixed(0) || 'N/A'}
          </div>
          <div style={gaugeStyles.unit}>hPa</div>
        </div>
        <div style={gaugeStyles.label}>Pressure</div>
        <div style={gaugeStyles.statusBar}>
          <div 
            style={{
              ...gaugeStyles.statusIndicator,
              width: `${calculatePercentage(
                latestData.pressure || 0,
                gaugeConfig.pressure.min,
                gaugeConfig.pressure.max
              )}%`,
              backgroundColor: gaugeConfig.pressure.color
            }}
          />
        </div>
      </div>

      {/* Altitude Gauge */}
      <div style={gaugeStyles.gauge}>
        <div style={gaugeStyles.readingContainer}>
          <div style={gaugeStyles.value}>
            {latestData.altitude?.toFixed(1) || 'N/A'}
          </div>
          <div style={gaugeStyles.unit}>m</div>
        </div>
        <div style={gaugeStyles.label}>Altitude</div>
        <div style={gaugeStyles.statusBar}>
          <div 
            style={{
              ...gaugeStyles.statusIndicator,
              width: `${calculatePercentage(
                latestData.altitude || 0,
                gaugeConfig.altitude.min,
                gaugeConfig.altitude.max
              )}%`,
              backgroundColor: gaugeConfig.altitude.color
            }}
          />
        </div>
      </div>

      {/* Speed Gauge */}
      <div style={gaugeStyles.gauge}>
        <div style={gaugeStyles.readingContainer}>
          <div style={gaugeStyles.value}>
            {latestData.speed?.toFixed(1) || 'N/A'}
          </div>
          <div style={gaugeStyles.unit}>km/h</div>
        </div>
        <div style={gaugeStyles.label}>Speed</div>
        <div style={gaugeStyles.statusBar}>
          <div 
            style={{
              ...gaugeStyles.statusIndicator,
              width: `${calculatePercentage(
                latestData.speed || 0,
                gaugeConfig.speed.min,
                gaugeConfig.speed.max
              )}%`,
              backgroundColor: gaugeConfig.speed.color
            }}
          />
        </div>
      </div>

      {/* Last Updated Info */}
      <div style={gaugeStyles.infoRow}>
        <div style={gaugeStyles.infoLabel}>Last Updated</div>
        <div style={gaugeStyles.infoValue}>
          {latestData.timestamp ? new Date(latestData.timestamp).toLocaleTimeString() : 'N/A'}
        </div>
      </div>
    </div>
  );
}

export default SensorGauges;