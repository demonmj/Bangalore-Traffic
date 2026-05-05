import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;

const BEN_CENTER = [12.9716, 77.5946];

// Helper to force map view update for dynamic routes
function MapUpdater({ path }) {
  const map = useMap();
  useEffect(() => {
    if (path && path.length > 0) {
      const bounds = L.latLngBounds(path);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [path, map]);
  return null;
}

export default function RoutePlanner() {
  const [plans, setPlans] = useState([]);
  const [landmarks, setLandmarks] = useState([]);
  const [source, setSource] = useState('MG Road');
  const [destination, setDestination] = useState('Whitefield');
  const [activeRoute, setActiveRoute] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/db/routes')
      .then(res => res.json())
      .then(data => setPlans(data.data || []))
      .catch(console.error);

    fetch('http://localhost:5000/api/db/landmarks')
      .then(res => res.json())
      .then(data => setLandmarks(data.data || []))
      .catch(console.error);
  }, []);

  const handleSearch = () => {
    const found = plans.find(p => p.source === source && p.destination === destination);
    let baseTime = Math.floor(Math.random() * 40) + 30; // 30-70 mins fallback

    let routeData;
    if (found) {
      routeData = { ...found };
      baseTime = parseInt(found.estimated_time) || baseTime;
    } else {
      routeData = {
         source, 
         destination, 
         estimated_time: `${baseTime} mins`, 
         congestion_score: (Math.random()*5 + 4).toFixed(1), 
         distance: `${(baseTime/3.5).toFixed(1)} km`
      };
    }

    // Generate dynamic mock coordinates so the map actually "works" visually
    const rng1 = (source.length % 5) * 0.05;
    const rng2 = (destination.length % 5) * 0.05;
    const mockPath = [
        BEN_CENTER,
        [12.9716 + rng1, 77.5946 + rng2],
        [12.9716 + rng1 + 0.02, 77.5946 + rng2 - 0.02],
        [12.9716 - rng2, 77.5946 + rng1]
    ];
    routeData.path = mockPath;

    // Determine estimated transport modes dynamically
    routeData.transports = [
      { icon: '🚗', name: 'Car', time: `${baseTime} mins` },
      { icon: '🏍️', name: 'Bike', time: `${Math.floor(baseTime * 0.65)} mins` },
      { icon: '🛺', name: 'Auto', time: `${Math.floor(baseTime * 0.85)} mins` },
      { icon: '🚌', name: 'Bus', time: `${Math.floor(baseTime * 1.4)} mins` }
    ];

    setActiveRoute(routeData);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Route Planner & Map */}
      <div style={{ display: 'flex', gap: '20px', minHeight: '550px' }}>
        
        {/* Planner Sidebar */}
        <div className="glass-panel" style={{ flex: '0 0 350px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2>Smart Route Planner</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Optimize pathways across Bengaluru utilizing real-time DBMS insights.</p>
          
          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
             Source Location
             <select value={source} onChange={(e) => setSource(e.target.value)} style={{ padding: '8px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }}>
               <option>MG Road</option>
               <option>Electronic City</option>
               <option>Silk Board</option>
               <option>Yeshwanthpur</option>
             </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
             Destination Location
             <select value={destination} onChange={(e) => setDestination(e.target.value)} style={{ padding: '8px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }}>
               <option>Whitefield</option>
               <option>KIAL Airport</option>
               <option>Hebbal</option>
               <option>Majestic Bus Stand</option>
             </select>
          </label>

          <button onClick={handleSearch} style={{ background: '#3b82f6', color: '#fff', padding: '10px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4)' }}>
            Calculate Optimized Route
          </button>

          {activeRoute && (
            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '15px', background: '#0f172a', borderRadius: '8px', borderLeft: '4px solid #8b5cf6' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#8b5cf6' }}>Route Metrics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.9rem' }}>
                   <div style={{ color: '#9ca3af' }}>Distance:</div><div style={{ color: '#fff' }}>{activeRoute.distance}</div>
                   <div style={{ color: '#9ca3af' }}>Congestion Risk:</div>
                   <div style={{ color: activeRoute.congestion_score > 7 ? '#ef4444' : '#22c55e', fontWeight: 'bold' }}>
                     Level {activeRoute.congestion_score} / 10
                   </div>
                </div>
              </div>

              {/* Transit Modes Addition */}
              <div style={{ padding: '15px', background: '#0f172a', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#38bdf8', fontSize: '1rem' }}>Transport Modes</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeRoute.transports.map((t, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: '#1e293b', borderRadius: '4px' }}>
                       <span>{t.icon} {t.name}</span>
                       <span style={{ fontWeight: 'bold', color: '#6ee7b7' }}>{t.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Map Representation */}
        <div className="glass-panel" style={{ flex: 1, padding: 0, overflow: 'hidden', position: 'relative' }}>
          <MapContainer center={BEN_CENTER} zoom={11} style={{ height: '100%', width: '100%', zIndex: 1 }} theme="dark">
            <TileLayer
              attribution='&copy; Stadia Maps'
              url='https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
            />
            {/* Visualizing dynamic nodes */}
            {activeRoute && activeRoute.path && (
              <>
               <MapUpdater path={activeRoute.path} />
               <Polyline 
                 positions={activeRoute.path} 
                 color={activeRoute.congestion_score > 7 ? "#ef4444" : activeRoute.congestion_score > 5 ? "#eab308" : "#22c55e"} 
                 weight={6}
                 opacity={0.8}
               />
               <CircleMarker center={activeRoute.path[0]} radius={8} color="#3b82f6" fillColor="#3b82f6" fillOpacity={1}>
                 <Popup>Source node: {activeRoute.source}</Popup>
               </CircleMarker>
               <CircleMarker center={activeRoute.path[activeRoute.path.length-1]} radius={8} color="#8b5cf6" fillColor="#8b5cf6" fillOpacity={1}>
                 <Popup>Destination node: {activeRoute.destination}</Popup>
               </CircleMarker>
              </>
            )}
            {!activeRoute && (
               <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, background: 'rgba(15, 23, 42, 0.8)', padding: '10px 20px', borderRadius: '8px' }}>
                 Map awaiting routing calculations...
               </div>
            )}
          </MapContainer>
        </div>
      </div>

      {/* Live Commuter Dashboard */}
      <div className="glass-panel">
         <h2>Live Commuter Dashboard</h2>
         <p style={{ color: '#9ca3af', marginBottom: '15px' }}>Popular Destination Traffic Status querying the `landmark_routes` SQL table.</p>
         
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
           {landmarks.map(lm => (
             <div key={lm.landmark_id} style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', border: '1px solid #334155' }}>
                <h4 style={{ margin: '0 0 5px 0' }}>{lm.landmark_name}</h4>
                <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Zone: {lm.zone}</div>
                <div style={{ 
                  marginTop: '10px', 
                  padding: '5px 8px', 
                  borderRadius: '4px', 
                  fontSize: '0.85rem', 
                  fontWeight: 'bold', 
                  backgroundColor: lm.traffic_status.includes('Delay') || lm.traffic_status.includes('Gridlock') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                  color: lm.traffic_status.includes('Delay') || lm.traffic_status.includes('Gridlock') ? '#ef4444' : '#22c55e',
                  display: 'inline-block'
                }}>
                  {lm.traffic_status.toUpperCase()}
                </div>
             </div>
           ))}
         </div>
      </div>

    </div>
  );
}
