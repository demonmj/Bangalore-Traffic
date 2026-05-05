// Mock Database module connecting exact Postgres schema structures for demo purposes
// Intercepts the raw SQL strings and outputs hardcoded/synthetic TimescaleDB JSON representations.

class MockDB {
  constructor() {
    this.roads = [
      { road_id: 1, road_name: 'Outer Ring Road', zone: 'East', latitude: 12.9229, longitude: 77.6830 },
      { road_id: 2, road_name: 'Hosur Road', zone: 'South', latitude: 12.9090, longitude: 77.6254 },
      { road_id: 3, road_name: 'MG Road', zone: 'Central', latitude: 12.9738, longitude: 77.6119 },
      { road_id: 4, road_name: 'Tumkur Road', zone: 'North', latitude: 13.0382, longitude: 77.5255 },
      { road_id: 5, road_name: 'Mysore Road', zone: 'West', latitude: 12.9388, longitude: 77.5234 },
    ];
    
    this.alerts = [
      { alert_id: 101, road_id: 1, alert_level: 'critical', message: 'Severe congestion detected. Level 8.5', generated_at: new Date(Date.now() - 60000).toISOString(), status: 'active' },
      { alert_id: 102, road_id: 3, alert_level: 'warning', message: 'Moderate congestion detected. Level 6.2', generated_at: new Date(Date.now() - 150000).toISOString(), status: 'active' },
    ];

    this.signals = [
      { signal_id: 1, junction_name: 'Agara Junction', road_id: 1, green_time: 45, red_time: 45, adaptive_mode: false, updated_at: new Date().toISOString() },
      { signal_id: 2, junction_name: 'Madiwala Checkpost', road_id: 2, green_time: 30, red_time: 60, adaptive_mode: true, updated_at: new Date().toISOString() },
    ];

    this.routePlans = [
      { route_id: 1, source: 'MG Road', destination: 'Whitefield', estimated_time: '45 mins', congestion_score: 8.2, distance: '14 km' },
      { route_id: 2, source: 'Electronic City', destination: 'KIAL Airport', estimated_time: '90 mins', congestion_score: 9.1, distance: '55 km' },
      { route_id: 3, source: 'Silk Board', destination: 'Hebbal', estimated_time: '55 mins', congestion_score: 7.5, distance: '22 km' },
    ];

    this.landmarkRoutes = [
      { landmark_id: 1, landmark_name: 'Kempegowda Int. Airport', zone: 'North', traffic_status: 'Heavy Delay' },
      { landmark_id: 2, landmark_name: 'Majestic Bus Stand', zone: 'Central', traffic_status: 'Moderate' },
      { landmark_id: 3, landmark_name: 'Electronic City IT Park', zone: 'South', traffic_status: 'Clear' },
      { landmark_id: 4, landmark_name: 'Whitefield Tech Zone', zone: 'East', traffic_status: 'Heavy Delay' },
      { landmark_id: 5, landmark_name: 'Silk Board Junction', zone: 'South', traffic_status: 'Severe Gridlock' }
    ];

    this.trafficHistory = Array.from({length: 150}).map((_, i) => {
      const road = this.roads[i % 5];
      return {
        traffic_id: 1000 + i,
        road_id: road.road_id,
        road_name: road.road_name,
        zone: road.zone,
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        vehicle_count: Math.floor(Math.random() * 300) + 20,
        avg_speed: Math.floor(Math.random() * 60) + 5,
        congestion_level: (Math.random() * 10).toFixed(2)
      };
    }).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async query(sqlText, params = []) {
    const sql = sqlText.toLowerCase();

    // 1. Initial Road Load / Poller Base
    if (sql.includes('select road_id, road_name, latitude, longitude from roads')) {
      return { rows: this.roads };
    }

    // 2. Live Congestion Start View
    if (sql.includes('select * from live_congestion')) {
      const live = this.roads.map(r => ({
         ...r, 
         timestamp: new Date().toISOString(), 
         vehicle_count: Math.floor(Math.random() * 200),
         avg_speed: Math.floor(Math.random() * 40),
         congestion_level: (Math.random() * 10).toFixed(2)
      }));
      return { rows: live };
    }

    // 3. Sp_optimize_signals
    if (sql.includes('call sp_optimize_signals')) {
      this.signals.forEach(s => {
         s.adaptive_mode = true;
         s.updated_at = new Date().toISOString();
         s.green_time = Math.max(15, Math.floor(30 + Math.random() * 40));
         s.red_time = Math.max(15, Math.floor(20 + Math.random() * 30));
      });
      return { rows: [] };
    }

    // 4. Signals Join Map
    if (sql.includes('select s.*, r.road_name from signals s join roads r')) {
      const resp = this.signals.map(s => {
        const r = this.roads.find(road => road.road_id === s.road_id);
        return { ...s, road_name: r ? r.road_name : 'Unknown' };
      });
      return { rows: resp };
    }
    
    // 5. Signals DB insight endpoints
    if (sql.includes('select r.road_name, s.junction_name, s.green_time, s.red_time')) {
       // Exact identical signature output as 4 above
       const resp = this.signals.map(s => {
        const r = this.roads.find(road => road.road_id === s.road_id);
        return { ...s, road_name: r ? r.road_name : 'Unknown' };
      });
      return { rows: resp };
    }

    // 5b. Raw Select Signals
    if (sql.includes('select * from signals')) {
       return { rows: this.signals };
    }

    // 6. Triggers API
    if (sql.includes('select * from alerts')) {
      return { rows: this.alerts };
    }

    // 7. Busiest Routes
    if (sql.includes('select * from busiest_routes_result') || sql.includes('group by r.road_name order by avg_congestion')) {
      const mockRoutes = this.roads.map(r => ({
        road_name: r.road_name,
        avg_vehicles: Math.floor(100 + Math.random() * 150),
        avg_congestion: (Math.random() * 6 + 4).toFixed(2) // 4 to 10
      }));
      mockRoutes.sort((a,b) => parseFloat(b.avg_congestion) - parseFloat(a.avg_congestion));
      return { rows: mockRoutes };
    }

    // 8. SQL Insights (Classic INNER JOIN)
    if (sql.includes('select t.traffic_id, r.road_name, r.zone, t.vehicle_count, t.avg_speed, t.timestamp')) {
       return { rows: this.trafficHistory.slice(0, 25) };
    }

    // 9. Historical Explorer
    if (sql.includes('select td.timestamp, r.road_name, td.vehicle_count, td.avg_speed, td.congestion_level')) {
       const offset = params[0] || 0;
       return { rows: this.trafficHistory.slice(offset, offset + 50) };
    }

    // 10. Poller Insertion (Silent capture)
    if (sql.includes('insert into traffic_data')) {
      // Simulate trigger logic automatically inside the database mockup
      const jam = parseFloat(params[3]);
      if (jam >= 8) {
         this.alerts.unshift({ alert_id: Math.floor(Math.random()*10000), road_id: params[0], alert_level: 'critical', message: `Severe congestion detected. Level ${jam}`, generated_at: new Date().toISOString(), status: 'active' });
      }
      return { rowCount: 1 };
    }

    // 11. Route Planner Mock
    if (sql.includes('select * from route_plans')) {
      return { rows: this.routePlans };
    }

    // 12. Landmark Mock
    if (sql.includes('select * from landmark_routes')) {
      return { rows: this.landmarkRoutes };
    }

    // Default Fallback
    console.warn("Unmatched SQL Mock Query:", sql);
    return { rows: [] };
  }
}

const mockDbInstance = new MockDB();

module.exports = {
  query: (text, params) => mockDbInstance.query(text, params),
  pool: {} // Mock pool
};
