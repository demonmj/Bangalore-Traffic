const db = require('../dbMock');
const axios = require('axios');
const Bull = require('bull');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const trafficQueue = new Bull('traffic-polling', REDIS_URL);

/**
 * Mocks the Google / Open Data API
 * We will select all roads and assign synthetic traffic data for the live view
 */
const pollTrafficData = async (io) => {
  try {
    const roadsResult = await db.query('SELECT road_id, road_name, latitude, longitude FROM roads');
    const roads = roadsResult.rows;

    const updates = [];

    for (const road of roads) {
      // Simulate Google CurrentFlow JSON
      const currentFlow = {
        speed: Math.max(10, Math.floor(60 - Math.random() * 40)), // 10 to 60 kmph
        vehicleCount: Math.floor(Math.random() * 200) + 10,       // 10 to 210
        jamFactor: Math.random() * 10                             // 0 to 10
      };

      // Map to TrafficData Schema
      const avg_speed = currentFlow.speed;
      const vehicle_count = currentFlow.vehicleCount;
      const congestion_level = currentFlow.jamFactor.toFixed(2);

      // Insert into timescale DB
      try {
        await db.query(
          `INSERT INTO traffic_data (road_id, vehicle_count, avg_speed, congestion_level)
           VALUES ($1, $2, $3, $4)`,
          [road.road_id, vehicle_count, avg_speed, congestion_level]
        );
      } catch(dbErr) {}

      updates.push({
        road_id: road.road_id,
        road_name: road.road_name,
        latitude: road.latitude,
        longitude: road.longitude,
        vehicle_count,
        avg_speed,
        congestion_level
      });
    }

    // Attempt ML Service call for Forecast Center metrics mapping (Fail quietly if ML container is down)
    try {
      const mlResponse = await axios.post(`${ML_SERVICE_URL}/optimize/signals`, { data: updates });
      if (io && mlResponse.data && mlResponse.data.results) {
        io.emit('forecast_update', mlResponse.data.results);
      }
    } catch(e) {
      // ML service not up, ignore
    }
    
    // Also trigger signal optimization SP
    try { await db.query('CALL sp_optimize_signals()'); } catch(e) {}

    // Emit live WebSocket update to all clients
    if (io) {
      io.emit('traffic_update', updates);
      
      // Load and emit signals
      try {
        const signals = await db.query('SELECT * FROM signals');
        io.emit('signals_update', signals.rows);
      } catch(e) {}
      
      // Alerts
      try {
        const alerts = await db.query("SELECT * FROM alerts WHERE status = 'active' ORDER BY generated_at DESC LIMIT 5");
        io.emit('alerts_update', alerts.rows);
      } catch(e) {}
    }
    
    console.log(`Polled synthetic data for ${updates.length} roads at ${new Date().toISOString()}`);

  } catch (error) {
    console.error('Error polling traffic data:', error.message || error);
  }
};

// Setup Bull queue processing
trafficQueue.process(async (job, done) => {
  // Normally the worker processes the queue job.
  // We'll pass the io instance dynamically from the server if possible,
  // but since Bull runs across processes, we'd traditionally use a Redis pub/sub.
  // For this local single-instance mockup, we will trigger it directly via setTimeout loop in server too.
  done();
});

let isPolling = false;

const startPolling = (io) => {
  if (isPolling) return;
  isPolling = true;

  // Poll every 60 seconds as per project requirement (but faster for demo visually: 15 seconds)
  setInterval(() => {
    pollTrafficData(io);
  }, 15000);

  // Poll immediately on start
  setTimeout(() => pollTrafficData(io), 2000);
};

module.exports = { startPolling, pollTrafficData };
