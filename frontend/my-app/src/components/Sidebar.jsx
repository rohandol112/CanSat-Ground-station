// src/components/Sidebar.jsx
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar({ activeSection, onMetricSelect }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠', path: '/' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { id: 'temperature', label: 'Temperature', icon: '🌡️', metric: 'temperature' },
    { id: 'humidity', label: 'Humidity', icon: '💧', metric: 'humidity' },
    { id: 'pressure', label: 'Pressure', icon: '🔄', metric: 'pressure' },
    { id: 'altitude', label: 'Altitude', icon: '🏔️', metric: 'altitude' },
    { id: 'speed', label: 'Speed', icon: '⚡', metric: 'speed' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/dashboard' },
  ];

  const handleNavigation = (item) => {
    if (item.path) {
      navigate(item.path);
      if (item.id === 'home') {
        onMetricSelect('home');
      } else if (item.id === 'dashboard') {
        onMetricSelect('dashboard');
      }
    } else if (item.metric && onMetricSelect) {
      navigate('/dashboard');
      onMetricSelect(item.metric);
    }
  };

  return (
    <div className="sidebar">
      <div className="logo" onClick={() => handleNavigation({ path: '/', id: 'home' })}>
        <span className="logo-text">SensorIQ<span style={{ color: '#00ff00' }}>.</span></span>
      </div>
      
      <div className="tabs">
        <button 
          className={`tab ${activeSection === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleNavigation({ path: '/dashboard', id: 'dashboard' })}
        >
          Dashboard
        </button>
        <button 
          className={`tab ${activeSection === 'home' ? 'active' : ''}`}
          onClick={() => handleNavigation({ path: '/', id: 'home' })}
        >
          Home
        </button>
      </div>
      
      <nav className="nav-items">
        {navItems.map(item => {
          const isActive = 
            (item.id === activeSection) || 
            (item.metric && activeSection === item.metric);
          
          return (
            <div 
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavigation(item)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
          );
        })}
      </nav>
      
      <div className="vip-section">
        <div className="vip-club">AI Powered</div>
      </div>
    </div>
  );
}

export default Sidebar;