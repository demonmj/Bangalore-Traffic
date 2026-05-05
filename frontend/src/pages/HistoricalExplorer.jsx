import React, { useEffect, useState } from 'react';

export default function HistoricalExplorer() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);

  const fetchHistory = (pageIndex) => {
    fetch(`http://localhost:5000/api/db/history?offset=${pageIndex * 50}`)
      .then(res => res.json())
      .then(res => setData(res))
      .catch(console.error);
  };

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  const handleExport = () => {
    alert("Export triggered! In a full environment, this would cleanly pipe the PostgreSQL COPY command to CSV streams.");
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Historical Traffic Data Explorer</h2>
        <button onClick={handleExport} style={{ background: '#3b82f6', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Export CSV (Mock)
        </button>
      </div>
      <p style={{ color: '#ccc' }}>Searchable and paginated timeseries data visualization of the `traffic_data` Hypertable.</p>

      {data && (
        <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px', color: '#6ee7b7', fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: '10px' }}>
          &gt; {data.query}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #334155', borderRadius: '8px' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#1e293b', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            <tr style={{ color: '#94a3b8' }}>
               <th style={{ padding: '12px' }}>Timestamp</th>
               <th style={{ padding: '12px' }}>Road Identity</th>
               <th style={{ padding: '12px' }}>Congestion / 10</th>
               <th style={{ padding: '12px' }}>Volume</th>
               <th style={{ padding: '12px' }}>Avg Speed</th>
            </tr>
          </thead>
          <tbody>
            {(data?.data || []).map((row, idx) => (
               <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                 <td style={{ padding: '10px', fontSize: '0.85rem' }}>{new Date(row.timestamp).toLocaleString()}</td>
                 <td style={{ padding: '10px' }}>{row.road_name}</td>
                 <td style={{ padding: '10px' }}>{row.congestion_level}</td>
                 <td style={{ padding: '10px' }}>{row.vehicle_count}</td>
                 <td style={{ padding: '10px' }}>{row.avg_speed} kmh</td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '10px 0' }}>
        <button disabled={page === 0} onClick={() => setPage(page - 1)} style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Previous 50</button>
        <span style={{ alignSelf: 'center' }}>Page {page + 1}</span>
        <button onClick={() => setPage(page + 1)} style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Next 50</button>
      </div>

    </div>
  );
}
