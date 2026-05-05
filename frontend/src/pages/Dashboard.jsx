import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function Dashboard({ socket }) {
  const [alerts, setAlerts] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    // Initial fetch
    fetch(import.meta.env.VITE_API_URL + '/api/analytics')
      .then(r => r.json())
      .then(data => {
        setAlerts(data.activeAlerts || []);
        if (data.topRoutes) drawChart(data.topRoutes);
      })
      .catch(console.error);

    // Live socket updates
    socket.on('alerts_update', (data) => setAlerts(data));
    socket.on('traffic_update', (data) => {
      // Sort to get top 5 busiest for chart
      const top = [...data].sort((a,b) => b.congestion_level - a.congestion_level).slice(0, 5);
      drawChart(top);
    });

    return () => {
      socket.off('alerts_update');
      socket.off('traffic_update');
    };
  }, [socket]);

  const drawChart = (data) => {
    if (!chartRef.current || data.length === 0) return;
    const container = d3.select(chartRef.current);
    container.selectAll("*").remove();

    const margin = {top: 20, right: 30, bottom: 40, left: 90};
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = container
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, 10]) // congestion level 0-10
      .range([0, width]);
    
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text").style("fill", "#94a3b8");

    const y = d3.scaleBand()
      .range([0, height])
      .domain(data.map(d => d.road_name))
      .padding(.1);
    
    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text").style("fill", "#94a3b8");

    svg.selectAll(".domain, .tick line").style("stroke", "#334155");

    svg.selectAll("myRect")
      .data(data)
      .join("rect")
      .attr("x", x(0) )
      .attr("y", d => y(d.road_name))
      .attr("width", d => 0)
      .attr("height", y.bandwidth())
      .attr("fill", "#eab308")
      .transition()
      .duration(800)
      .attr("width", d => x(d.congestion_level || d.avg_congestion || 0));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="dashboard-grid">
        <div className="glass-panel">
          <h3>Busiest Routes Flow</h3>
          <div ref={chartRef} style={{ marginTop: '20px' }}></div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3>Recent System Alerts</h3>
          <div style={{ marginTop: '20px', flex: 1, overflowY: 'auto' }}>
            {alerts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No active alerts.</p>
            ) : (
              alerts.map(a => (
                <div key={a.alert_id} className={`alert-pill alert-${a.alert_level}`}>
                  {a.message} - {new Date(a.generated_at).toLocaleTimeString()}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="glass-panel">
        <h3>Predictive Analytics Overview</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
          LSTM Model forecasts predict severe congestion along Outer Ring Road in the next 45 minutes due to increasing density gradients. XGBoost signal adjustment triggered at Sony World Junction.
        </p>
      </div>
    </div>
  );
}
