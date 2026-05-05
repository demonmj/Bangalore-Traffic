import React, { useEffect, useState } from 'react';

export default function SignalOptimization() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/db/signals-sp')
      .then(res => res.json())
      .then(res => setData(res))
      .catch(console.error);
  }, []);

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2>Stored Procedure: Signal Optimization Results</h2>
      <p style={{ color: '#ccc' }}>Executes <code style={{color: '#eab308'}}>CALL sp_optimize_signals()</code> to dynamically apply Adaptive Control schemas for intersections, joined with the Roads table.</p>

      {data && (
        <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px', color: '#6ee7b7', fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: '10px', overflowX: 'auto' }}>
          &gt; {data.query}
        </div>
      )}

      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
            <th style={{ padding: '10px' }}>Junction</th>
            <th style={{ padding: '10px' }}>Road Link</th>
            <th style={{ padding: '10px' }}>Green Time</th>
            <th style={{ padding: '10px' }}>Red Time</th>
            <th style={{ padding: '10px' }}>Adaptive Mode</th>
            <th style={{ padding: '10px' }}>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.map((row, idx) => (
             <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
               <td style={{ padding: '10px' }}>{row.junction_name}</td>
               <td style={{ padding: '10px' }}>{row.road_name}</td>
               <td style={{ padding: '10px', color: '#22c55e', fontWeight: 'bold' }}>{row.green_time}s</td>
               <td style={{ padding: '10px', color: '#ef4444', fontWeight: 'bold' }}>{row.red_time}s</td>
               <td style={{ padding: '10px' }}>{row.adaptive_mode ? 'Active' : 'Static'}</td>
               <td style={{ padding: '10px', fontSize: '0.85rem' }}>{new Date(row.updated_at).toLocaleTimeString()}</td>
             </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
