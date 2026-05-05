const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./dbMock');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Broadcast Real-time Data to Clients
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Initial DB State push can go here
  db.query('SELECT * FROM live_congestion').then(res => {
    socket.emit('initial_traffic', res.rows);
  }).catch(err => console.error(err));

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Basic Info API
app.get('/api/status', (req, res) => {
  res.json({ status: 'API is running' });
});

// API: Get Live Analytics Data
app.get('/api/analytics', async (req, res) => {
  try {
    const busiest = await db.query('SELECT * FROM busiest_routes_result LIMIT 10');
    // For simulation, if table is empty due to SP not running:
    let topRoutes = busiest.rows;
    if (topRoutes.length === 0) {
      const fallback = await db.query(`
        SELECT r.road_name, AVG(t.vehicle_count) as avg_vehicles, AVG(t.congestion_level) as avg_congestion 
        FROM roads r 
        LEFT JOIN traffic_data t ON r.road_id = t.road_id 
        GROUP BY r.road_name ORDER BY avg_congestion DESC LIMIT 5
      `);
      topRoutes = fallback.rows;
    }
    const alerts = await db.query("SELECT * FROM alerts WHERE status = 'active' ORDER BY generated_at DESC");
    
    res.json({
      topRoutes,
      activeAlerts: alerts.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// API: Get Signals Data
app.get('/api/signals', async (req, res) => {
  try {
    const signals = await db.query('SELECT s.*, r.road_name FROM signals s JOIN roads r ON s.road_id = r.road_id');
    res.json(signals.rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Optional: manually trigger polling (for local dev)
app.post('/api/trigger-poll', async (req, res) => {
  const { pollTrafficData } = require('./workers/trafficPoller');
  await pollTrafficData(io);
  res.json({ success: true, message: 'Polled mock API successfully' });
});

// API: Proxy ML Route Load
app.get('/api/route-load', async (req, res) => {
  try {
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.get(`${ML_SERVICE_URL}/predict/route-load`);
    res.json(response.data);
  } catch (error) {
    console.error('ML service not responding', error.message);
    res.status(500).json({ error: 'ML prediction failed' });
  }
});

// API: Smart Route Planner Plans
app.get('/api/db/routes', async (req, res) => {
  try {
    const sql = "SELECT * FROM route_plans";
    const result = await db.query(sql);
    res.json({ query: sql, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Airport & Landmark Routes
app.get('/api/db/landmarks', async (req, res) => {
  try {
    const sql = "SELECT * FROM landmark_routes ORDER BY traffic_status ASC";
    const result = await db.query(sql);
    res.json({ query: sql, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// DBMS MINI-PROJECT ENDPOINTS
// ==========================================

// API: DB Insights (Show Raw Joined Query Data)
app.get('/api/db/insights', async (req, res) => {
  try {
    // A classic INNER JOIN to showcase database capabilities
    const sql = `
      SELECT t.traffic_id, r.road_name, r.zone, t.vehicle_count, t.avg_speed, t.timestamp
      FROM traffic_data t
      INNER JOIN roads r ON t.road_id = r.road_id
      ORDER BY t.timestamp DESC
      LIMIT 25
    `;
    const result = await db.query(sql);
    res.json({ query: sql, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Triggers Activity (Raw alerts table fetch)
app.get('/api/db/triggers', async (req, res) => {
  try {
    const sql = "SELECT * FROM alerts ORDER BY generated_at DESC LIMIT 50";
    const result = await db.query(sql);
    res.json({ query: sql, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Historical Data Explorer (Paginated timeseries)
app.get('/api/db/history', async (req, res) => {
  try {
    const { offset = 0 } = req.query;
    const sql = "SELECT td.timestamp, r.road_name, td.vehicle_count, td.avg_speed, td.congestion_level FROM traffic_data td JOIN roads r ON r.road_id = td.road_id ORDER BY td.timestamp DESC LIMIT 50 OFFSET $1";
    const result = await db.query(sql, [offset]);
    res.json({ query: sql, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Signals Stored Procedure Results
app.get('/api/db/signals-sp', async (req, res) => {
  try {
    // Calling the SP and fetching results
    // Postgres procedures (CALL) don't typically return tables directly unless using OUT params, so we read the updated tables
    await db.query('CALL sp_optimize_signals()');
    const sql = "SELECT r.road_name, s.junction_name, s.green_time, s.red_time, s.adaptive_mode, s.updated_at FROM signals s JOIN roads r ON s.road_id = r.road_id ORDER BY s.updated_at DESC";
    const result = await db.query(sql);
    res.json({ query: "CALL sp_optimize_signals(); " + sql, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start polling worker once server is up
  const { startPolling } = require('./workers/trafficPoller');
  startPolling(io);
});
