import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RouteAnalytics({ socket }) {
  const [busiestRoutes, setBusiestRoutes] = useState([]);
  const [mlPredictions, setMlPredictions] = useState([]);
  const [sortKey, setSortKey] = useState('congestion');

  useEffect(() => {
    fetch('http://localhost:5000/api/analytics')
      .then(res => res.json())
      .then(data => {
        const routes = (data.topRoutes || []).map(r => ({
          name: r.road_name,
          vehicles: parseFloat(r.avg_vehicles).toFixed(0),
          congestion: parseFloat(r.avg_congestion).toFixed(2),
        }));
        setBusiestRoutes(routes);
      })
      .catch(console.error);

    fetch('http://localhost:5000/api/route-load')
      .then(res => res.json())
      .then(data => {
        if (data && data.busiest_routes_prob) {
           setMlPredictions(data.busiest_routes_prob.map(p => ({
             id: p.road_id,
             prob: Math.round(p.probability * 100)
           })));
        }
      })
      .catch(console.error);
  }, []);

  const sortedRoutes = [...busiestRoutes].sort((a, b) => {
    if (sortKey === 'congestion') return b.congestion - a.congestion;
    if (sortKey === 'vehicles') return b.vehicles - a.vehicles;
    return a.name.localeCompare(b.name);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-panel">
        <h2>Database Metrics: Busiest Route Analysis</h2>
        <p style={{ color: '#ccc', marginBottom: '20px' }}>Sortable data projection leveraging PostgreSQL GROUP BY aggregations mapping <code>avg_congestion</code> and <code>avg_vehicles</code> over Time.</p>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button onClick={() => setSortKey('congestion')} style={{ background: sortKey === 'congestion' ? '#3b82f6' : '#1e293b', color: '#fff', padding: '8px 16px', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer' }}>Sort by Congestion</button>
          <button onClick={() => setSortKey('vehicles')} style={{ background: sortKey === 'vehicles' ? '#3b82f6' : '#1e293b', color: '#fff', padding: '8px 16px', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer' }}>Sort by Vehicles</button>
          <button onClick={() => setSortKey('name')} style={{ background: sortKey === 'name' ? '#3b82f6' : '#1e293b', color: '#fff', padding: '8px 16px', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer' }}>Sort by Name</button>
        </div>

        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginBottom: '30px' }}>
          <thead style={{ backgroundColor: '#1e293b' }}>
            <tr style={{ color: '#94a3b8' }}>
              <th style={{ padding: '10px' }}>Route Name</th>
              <th style={{ padding: '10px' }}>Avg Congestion / 10</th>
              <th style={{ padding: '10px' }}>Avg Vehicle Count</th>
            </tr>
          </thead>
          <tbody>
            {sortedRoutes.map((route, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '10px' }}>{route.name}</td>
                <td style={{ padding: '10px', color: route.congestion > 7 ? '#ef4444' : '#22c55e' }}>{route.congestion}</td>
                <td style={{ padding: '10px' }}>{route.vehicles}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ height: '300px' }}>
           <h3>Aggregated Congestion Visualizer</h3>
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={sortedRoutes} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
               <CartesianGrid strokeDasharray="3 3" stroke="#333" />
               <XAxis type="number" stroke="#9ca3af" domain={[0, 10]} />
               <YAxis dataKey="name" type="category" stroke="#9ca3af" width={150} />
               <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
               <Legend />
               <Bar dataKey="congestion" fill="#8b5cf6" name="Avg Congestion Level" radius={[0, 4, 4, 0]} />
             </BarChart>
           </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
