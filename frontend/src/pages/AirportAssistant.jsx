import React, { useState } from 'react';

export default function AirportAssistant() {
  const [selectedOrigin, setSelectedOrigin] = useState(null);

  const presets = [
    { name: 'MG Road', delay: '25 mins', idealTime: '4:30 PM', bottleneck: 'Mekhri Circle' },
    { name: 'Whitefield', delay: '45 mins', idealTime: '3:00 PM', bottleneck: 'KR Puram Bridge' },
    { name: 'Electronic City', delay: '60 mins', idealTime: '2:15 PM', bottleneck: 'Silk Board & Hebbal' },
    { name: 'Yeshwanthpur', delay: '15 mins', idealTime: '5:00 PM', bottleneck: 'Hebbal Flyover' },
    { name: 'Majestic', delay: '30 mins', idealTime: '4:00 PM', bottleneck: 'Windsor Manor' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
        <h1 style={{ margin: 0, color: '#38bdf8' }}>✈️ Kempegowda International Airport</h1>
        <h2 style={{ margin: '10px 0 0 0', fontWeight: 'normal', color: '#94a3b8' }}>Live Route Assistant</h2>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ flex: '1 1 300px' }}>
           <h3>Select Origin Preset</h3>
           <p style={{ color: '#ccc', marginBottom: '20px' }}>Quick-compute real-time delay parameters from Major IT Hubs.</p>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
             {presets.map((preset, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setSelectedOrigin(preset)}
                  style={{
                    padding: '15px',
                    textAlign: 'left',
                    background: selectedOrigin?.name === preset.name ? '#3b82f6' : '#1e293b',
                    color: '#fff',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '1.05rem',
                    transition: '0.2s'
                  }}
                >
                  From {preset.name}
                </button>
             ))}
           </div>
        </div>

        <div className="glass-panel" style={{ flex: '2 1 400px' }}>
           <h3>Smart Peak-Hour Suggestions</h3>
           {selectedOrigin ? (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', borderRadius: '0 8px 8px 0' }}>
                   <div>
                     <div style={{ color: '#ef4444', fontWeight: 'bold' }}>Live Traffic Delay</div>
                     <div style={{ fontSize: '2rem', color: '#fff' }}>+ {selectedOrigin.delay}</div>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                     <div style={{ color: '#9ca3af' }}>Identified Bottleneck</div>
                     <div style={{ color: '#fff', fontWeight: 'bold' }}>{selectedOrigin.bottleneck}</div>
                   </div>
                </div>

                <div style={{ padding: '20px', background: 'rgba(34, 197, 94, 0.1)', borderLeft: '4px solid #22c55e', borderRadius: '0 8px 8px 0' }}>
                   <div style={{ color: '#22c55e', fontWeight: 'bold', marginBottom: '5px' }}>Optimal Departure Recommendation</div>
                   <div style={{ fontSize: '1.2rem' }}>Best time to leave for the airport: <strong>{selectedOrigin.idealTime}</strong></div>
                   <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#9ca3af' }}>This prediction minimizes intersection halts leveraging recorded SQL TimescaleDB historical patterns and XGBoost inferences.</p>
                </div>
             </div>
           ) : (
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '250px', color: '#64748b' }}>
                Select an origin routing preset to view peak-hour data.
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
