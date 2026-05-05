import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Activity, Map as MapIcon, BarChart2, CheckCircle, CloudRain, Shield, TrendingUp, Search, Database, GitMerge, Navigation, PlaneTakeoff } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import LiveMap from './pages/LiveMap';
import RoutePlanner from './pages/RoutePlanner';
import AirportAssistant from './pages/AirportAssistant';
import SchemaExplorer from './pages/SchemaExplorer';
import SignalOptimization from './pages/SignalOptimization';
import RouteAnalytics from './pages/RouteAnalytics';
import ForecastCenter from './pages/ForecastCenter';
import SqlInsights from './pages/SqlInsights';
import HistoricalExplorer from './pages/HistoricalExplorer';
import AdminPanel from './pages/AdminPanel';

// Setup Socket
const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:5000');

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Sidebar Navigation */}
        <nav className="sidebar">
          <div className="brand">
            <Activity className="h-8 w-8 text-blue-500" />
            <span>Bengaluru Traffic AI</span>
          </div>
          
          <div className="nav-links">
            <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <BarChart2 /> Dashboard
            </NavLink>
            <NavLink to="/map" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <MapIcon /> Live Heatmap
            </NavLink>
            <NavLink to="/route-planner" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <Navigation /> Smart Route Planner
            </NavLink>
            <NavLink to="/airport" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <PlaneTakeoff /> Airport Route Assistant
            </NavLink>
            <NavLink to="/schema" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <GitMerge /> Schema Explorer
            </NavLink>
            <NavLink to="/signals" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <CheckCircle /> Signal SP Optimizer
            </NavLink>
            <NavLink to="/analytics" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <TrendingUp /> Analytics Queries
            </NavLink>
            <NavLink to="/weather" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <CloudRain /> Prediction Timeseries
            </NavLink>
            <NavLink to="/insights" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <Database /> SQL Insights & Triggers
            </NavLink>
            <NavLink to="/history" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <Search /> Historical Explorer
            </NavLink>
            <NavLink to="/admin" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <Shield /> Admin Panel
            </NavLink>
          </div>
        </nav>

        {/* Main Workspace */}
        <main className="main-content">
          <header className="top-bar">
            <div className="page-title">Smart Traffic Analysis Platform (Practical Routing Edit)</div>
            <div className="status-indicator">
              {isConnected ? (
                <><div className="pulse"></div> Live Updates Active</>
              ) : (
                <>🔴 Disconnected from Server</>
              )}
            </div>
          </header>

          <div className="page-container">
            <Routes>
              <Route path="/" element={<Dashboard socket={socket} />} />
              <Route path="/map" element={<LiveMap socket={socket} />} />
              <Route path="/route-planner" element={<RoutePlanner />} />
              <Route path="/airport" element={<AirportAssistant />} />
              <Route path="/schema" element={<SchemaExplorer />} />
              <Route path="/signals" element={<SignalOptimization />} />
              <Route path="/analytics" element={<RouteAnalytics socket={socket} />} />
              <Route path="/weather" element={<ForecastCenter socket={socket} />} />
              <Route path="/insights" element={<SqlInsights />} />
              <Route path="/history" element={<HistoricalExplorer />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
