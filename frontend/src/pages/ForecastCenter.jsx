import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ForecastCenter({ socket }) {
  const [forecasts, setForecasts] = useState([]);
  const [rawPayload, setRawPayload] = useState([]);

  useEffect(() => {
    socket.on('forecast_update', (data) => {
      setRawPayload(data);
      const chartData = data.map(pred => ({
        name: `Road ${pred.road_id}`,
        '15 Mins': pred.predictions_15m,
        '30 Mins': pred.predictions_30m,
        '60 Mins': pred.predictions_60m,
      }));
      setForecasts(chartData);
    });

    return () => {
      socket.off('forecast_update');
    };
  }, [socket]);

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '600px' }}>
      <h2>AI Forecast Database Insights</h2>
      <p style={{ color: '#ccc' }}>Table mapping the ML generated values emitted via FastAPI and intercepted by WebSocket queue workers.</p>

      {forecasts.length === 0 ? (
        <div style={{ padding: '20px', color: '#9ca3af' }}>Waiting for ML predictions stream...</div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', border: '1px solid #334155', borderRadius: '8px' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#1e293b' }}>
                <tr style={{ color: '#94a3b8' }}>
                  <th style={{ padding: '10px' }}>Road ID</th>
                  <th style={{ padding: '10px' }}>+15m Horizon</th>
                  <th style={{ padding: '10px' }}>+30m Horizon</th>
                  <th style={{ padding: '10px' }}>+60m Horizon</th>
                  <th style={{ padding: '10px' }}>Optimized Timing Req</th>
                </tr>
              </thead>
              <tbody>
                {rawPayload.map((pred, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '10px' }}>{pred.road_id}</td>
                    <td style={{ padding: '10px' }}>{pred.predictions_15m}</td>
                    <td style={{ padding: '10px' }}>{pred.predictions_30m}</td>
                    <td style={{ padding: '10px', color: pred.predictions_60m > 7 ? '#ef4444' : '#fff' }}>{pred.predictions_60m}</td>
                    <td style={{ padding: '10px', color: '#22c55e' }}>{pred.suggested_green_time}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ flex: 1, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecasts} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[0, 10]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                <Legend />
                <Line type="monotone" dataKey="15 Mins" stroke="#3b82f6" activeDot={{ r: 8 }} strokeWidth={2} />
                <Line type="monotone" dataKey="30 Mins" stroke="#eab308" strokeWidth={2} />
                <Line type="monotone" dataKey="60 Mins" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
