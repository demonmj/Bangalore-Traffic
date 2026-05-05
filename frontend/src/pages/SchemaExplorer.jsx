import React, { useState } from 'react';

const schemas = {
  roads: {
    title: 'ROADS',
    description: 'Dimensional tracking table mapping latitude and longitude geometries to specific Bengaluru transport zones.',
    columns: [
      { name: 'road_id', type: 'SERIAL', pk: true },
      { name: 'road_name', type: 'VARCHAR(200)', req: true },
      { name: 'zone', type: 'VARCHAR(100)' },
      { name: 'latitude', type: 'DECIMAL(9,6)', req: true },
      { name: 'longitude', type: 'DECIMAL(9,6)', req: true },
      { name: 'road_type', type: 'VARCHAR(50)' }
    ],
    indexes: ['idx_roads_zone (Secondary)']
  },
  traffic_data: {
    title: 'TRAFFIC_DATA (TimescaleDB Hypertable)',
    description: 'Highly expansive TimescaleDB Hypertable partitioned implicitly by the timestamp attribute locking raw ingest data.',
    columns: [
      { name: 'traffic_id', type: 'BIGSERIAL', pk: true },
      { name: 'road_id', type: 'INTEGER', fk: 'roads(road_id)' },
      { name: 'timestamp', type: 'TIMESTAMPTZ', pk: true },
      { name: 'vehicle_count', type: 'INTEGER', req: true },
      { name: 'avg_speed', type: 'DECIMAL(6,2)' },
      { name: 'congestion_level', type: 'DECIMAL(4,2)' }
    ],
    indexes: ['idx_td_road_time (Composite: road_id, timestamp DESC)']
  },
  signals: {
    title: 'SIGNALS',
    description: 'Relational metrics dictating automated Junction adaptive timings bound to Stored Procedure optimization overrides.',
    columns: [
      { name: 'signal_id', type: 'SERIAL', pk: true },
      { name: 'junction_name', type: 'VARCHAR(200)', req: true },
      { name: 'road_id', type: 'INTEGER', fk: 'roads(road_id)' },
      { name: 'green_time', type: 'INTEGER', req: true },
      { name: 'red_time', type: 'INTEGER', req: true },
      { name: 'adaptive_mode', type: 'BOOLEAN' },
      { name: 'updated_at', type: 'TIMESTAMPTZ' }
    ],
    indexes: []
  },
  alerts: {
    title: 'ALERTS',
    description: 'Records automatically materialized by the background trg_auto_alert Trigger logic without external polling assistance.',
    columns: [
      { name: 'alert_id', type: 'BIGSERIAL', pk: true },
      { name: 'road_id', type: 'INTEGER', fk: 'roads(road_id)' },
      { name: 'alert_level', type: 'VARCHAR(20)' },
      { name: 'message', type: 'TEXT' },
      { name: 'generated_at', type: 'TIMESTAMPTZ' },
      { name: 'status', type: 'VARCHAR(20)' }
    ],
    indexes: ['idx_alerts_road_status']
  }
};

export default function SchemaExplorer() {
  const [active, setActive] = useState('traffic_data');
  const details = schemas[active];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '600px' }}>
      <div className="glass-panel" style={{ display: 'flex', gap: '30px' }}>
        
        <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2>Tables Map</h2>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Select a schema to inspect its constraints.</p>
          {Object.keys(schemas).map(key => (
            <button 
              key={key}
              onClick={() => setActive(key)}
              style={{
                textAlign: 'left',
                padding: '12px 15px',
                background: active === key ? '#3b82f6' : '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: '0.2s',
                fontFamily: 'monospace'
              }}
            >
              {key}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, paddingLeft: '20px', borderLeft: '1px solid #334155' }}>
          <h2 style={{ fontFamily: 'monospace', color: '#8b5cf6' }}>{details.title}</h2>
          <p style={{ color: '#ccc', marginBottom: '20px' }}>{details.description}</p>
          
          <h3>Columns Definition</h3>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead style={{ borderBottom: '2px solid #334155' }}>
              <tr style={{ color: '#94a3b8' }}>
                <th style={{ padding: '8px' }}>Name</th>
                <th style={{ padding: '8px' }}>Type</th>
                <th style={{ padding: '8px' }}>Constraint</th>
              </tr>
            </thead>
            <tbody>
              {details.columns.map((col, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '10px', fontFamily: 'monospace' }}>{col.name}</td>
                  <td style={{ padding: '10px', color: '#6ee7b7', fontFamily: 'monospace' }}>{col.type}</td>
                  <td style={{ padding: '10px', fontSize: '0.85rem' }}>
                    {col.pk && <span style={{ color: '#eab308', marginRight: '10px' }}>PRIMARY KEY</span>}
                    {col.fk && <span style={{ color: '#8b5cf6', marginRight: '10px' }}>FOREIGN KEY &rarr; {col.fk}</span>}
                    {col.req && <span style={{ color: '#ef4444' }}>NOT NULL</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {details.indexes.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h3>Active Logical Indexes</h3>
              <ul style={{ color: '#9ca3af', fontFamily: 'monospace' }}>
                {details.indexes.map((idx, i) => <li key={i}>{idx}</li>)}
              </ul>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
