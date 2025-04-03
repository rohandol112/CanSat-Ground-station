// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import { readFlightData, setupFlightDataPolling } from './utils/dataUtils';

// Layout component to handle sidebar and header
function Layout({ children, activeMetric, setActiveMetric }) {
  return (
    <div className="app">
      <Sidebar 
        activeSection={activeMetric} 
        onMetricSelect={setActiveMetric} 
      />
      <div className="main-content">
        <Header />
        {children}
      </div>
    </div>
  );
}

function App() {
  const [sensorData, setSensorData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('dashboard');
  const [flightData, setFlightData] = useState([]);

  // Load flight data
  useEffect(() => {
    const pollId = setupFlightDataPolling(data => {
      setFlightData(data);
      console.log("Updated flight data:", data.length > 0 ? data[data.length - 1] : "No data");
    }, 3000);
    
    return () => clearInterval(pollId);
  }, []);

  // Use mock data for now
  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      const mockData = generateMockData();
      const mockInsights = generateMockInsights();
      
      setSensorData(mockData);
      setInsights(mockInsights);
      setLoading(false);
    }, 1000);
  }, []);

  const generateMockData = () => {
    const data = [];
    const now = Date.now();
    
    for (let i = 0; i < 50; i++) {
      data.push({
        id: i,
        temperature: 20 + Math.random() * 15,
        humidity: 30 + Math.random() * 40,
        pressure: 800 + Math.random() * 50,
        altitude: Math.random() * 10,
        speed: Math.random() * 5,
        timestamp: now - (50 - i) * 60000, // Each data point is 1 minute apart
      });
    }
    
    return data;
  };

  const generateMockInsights = () => {
    return [
      {
        id: 1,
        type: 'alert',
        severity: 'high',
        message: 'Temperature spike detected. Values exceeded normal operating range by 12%.',
        timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
        relatedMetrics: ['temperature']
      },
      {
        id: 2,
        type: 'prediction',
        severity: 'medium',
        message: 'Humidity levels are projected to increase by 25% in the next hour based on current trends.',
        timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
        relatedMetrics: ['humidity']
      },
      {
        id: 3,
        type: 'status',
        severity: 'low',
        message: 'System has been running optimally for 24 hours with no anomalies detected.',
        timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
        relatedMetrics: ['temperature', 'humidity', 'pressure', 'altitude', 'speed']
      },
      {
        id: 4,
        type: 'recommendation',
        severity: 'low',
        message: 'Consider updating firmware to version 2.3.1 for improved accuracy.',
        timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
        relatedMetrics: ['temperature', 'humidity', 'pressure', 'altitude', 'speed']
      },
    ];
  };

  const renderDashboardContent = () => {
    if (loading) {
      return <div className="loading">Loading dashboard data...</div>;
    }
    
    return (
      <Dashboard 
        sensorData={sensorData} 
        insights={insights} 
        activeSection={activeMetric}
        flightData={flightData}
      />
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout activeMetric="home" setActiveMetric={setActiveMetric}>
            <Home sensorData={sensorData} />
          </Layout>
        } />
        <Route path="/dashboard" element={
          <Layout activeMetric={activeMetric} setActiveMetric={setActiveMetric}>
            {renderDashboardContent()}
          </Layout>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;