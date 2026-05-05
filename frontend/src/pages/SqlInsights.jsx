import React, { useEffect, useState } from 'react';

export default function SqlInsights() {
  const [insights, setInsights] = useState(null);
  const [triggers, setTriggers] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/db/insights')
      .then(res => res.json())
      .then(res => setInsights(res));
    
    fetch('http://localhost:5000/api/db/triggers')
      .then(res => res.json())
      .then(res => setTriggers(res));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div className="glass-panel">
        <h2>SQL Query Insights Panel (Data Joins)</h2>
        <p style={{ color: '#ccc', marginBottom: '15px' }}>Live projection querying normalized tables via explicit INNER joins to link road IDs to real-time traffic statistics.</p>
        
        {insights && (
          <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px', color: '#6ee7b7', fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: '15px', whiteSpace: 'pre-wrap' }}>
            {insights.query}
          </div>
        )}

        <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#1e293b' }}>
              <tr style={{ color: '#94a3b8' }}>
                <th style={{ padding: '10px' }}>ID</th>
                <th style={{ padding: '10px' }}>Road Name</th>
                <th style={{ padding: '10px' }}>Zone</th>
                <th style={{ padding: '10px' }}>Vol</th>
                <th style={{ padding: '10px' }}>Speed</th>
                <th style={{ padding: '10px' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {insights?.data?.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '8px 10px' }}>{row.traffic_id}</td>
                  <td style={{ padding: '8px 10px' }}>{row.road_name}</td>
                  <td style={{ padding: '8px 10px' }}>{row.zone}</td>
                  <td style={{ padding: '8px 10px' }}>{row.vehicle_count}</td>
                  <td style={{ padding: '8px 10px' }}>{row.avg_speed} km/h</td>
                  <td style={{ padding: '8px 10px', fontSize: '0.8rem' }}>{new Date(row.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-panel">
        <h2>Database Trigger Activity Monitor</h2>
        <p style={{ color: '#ccc', marginBottom: '15px' }}>Automated records generated entirely within PostgreSQL using <code style={{color: '#eab308'}}>trg_auto_alert</code> upon insertions over congestion limits.</p>
        
        {triggers && (
          <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px', color: '#6ee7b7', fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: '15px' }}>
            &gt; {triggers.query}
          </div>
        )}

        <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#1e293b' }}>
              <tr style={{ color: '#94a3b8' }}>
                <th style={{ padding: '10px' }}>Alert ID</th>
                <th style={{ padding: '10px' }}>Level</th>
                <th style={{ padding: '10px' }}>Message</th>
                <th style={{ padding: '10px' }}>Generated At</th>
              </tr>
            </thead>
            <tbody>
              {triggers?.data?.map((alert, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '8px 10px' }}>{alert.alert_id}</td>
                  <td style={{ padding: '8px 10px', color: alert.alert_level === 'critical' ? '#ef4444' : '#eab308' }}>
                    {alert.alert_level.toUpperCase()}
                  </td>
                  <td style={{ padding: '8px 10px' }}>{alert.message}</td>
                  <td style={{ padding: '8px 10px', fontSize: '0.8rem' }}>{new Date(alert.generated_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
