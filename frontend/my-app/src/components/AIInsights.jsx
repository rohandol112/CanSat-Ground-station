// src/components/AIInsights.jsx
import { useRef } from 'react';

function AIInsights({ insights }) {
  const insightsRef = useRef(null);

  if (!insights || insights.length === 0) {
    return (
      <div className="no-insights">
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>No AI insights available at this time.</p>
        </div>
      </div>
    );
  }

  // Function to format the timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="insights-wrapper">
      <div className="insights-list" ref={insightsRef}>
        {insights.map((insight) => (
          <div key={insight.id} className={`insight-item ${insight.severity}`}>
            <div className="insight-header">
              <div className={`insight-type ${insight.type}`}>
                {insight.type}
              </div>
              <div className="insight-time">{formatTimestamp(insight.timestamp)}</div>
            </div>
            <div className="insight-message">{insight.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AIInsights;