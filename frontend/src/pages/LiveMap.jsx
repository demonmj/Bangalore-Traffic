import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;

const BEN_CENTER = [12.9716, 77.5946];

export default function LiveMap({ socket }) {
  const [trafficData, setTrafficData] = useState([]);

  useEffect(() => {
    socket.on('traffic_update', (data) => {
      setTrafficData(data);
    });

    return () => {
      socket.off('traffic_update');
    };
  }, [socket]);

  // Determine color based on congestion
  const getTrafficColor = (level) => {
    if (level < 3) return '#22c55e'; // Green
    if (level < 7) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div className="glass-panel" style={{ height: '700px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2>Bengaluru Live Traffic Heatmap</h2>
      <div className="map-container" style={{ flex: 1, position: 'relative' }}>
        <MapContainer 
          center={BEN_CENTER} 
          zoom={12} 
          style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
          theme="dark"
        >
          <TileLayer
            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a>'
            url='https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
          />
          
          {trafficData.map((node) => (
            <CircleMarker
              key={node.road_id}
              center={[node.latitude, node.longitude]}
              radius={node.congestion_level * 1.5 + 5}
              pathOptions={{ 
                color: getTrafficColor(node.congestion_level),
                fillColor: getTrafficColor(node.congestion_level),
                fillOpacity: 0.6,
                weight: 2
              }}
            >
              <Popup>
                <div style={{ color: '#333' }}>
                  <strong>{node.road_name}</strong><br/>
                  Congestion: {node.congestion_level} / 10<br/>
                  Speed: {node.avg_speed} km/h<br/>
                  Vehicles: {node.vehicle_count}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
