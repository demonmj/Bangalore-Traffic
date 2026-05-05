import React, { useState } from 'react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('ml');

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2>System Administration</h2>
      
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        <button 
          onClick={() => setActiveTab('ml')}
          style={{ background: activeTab === 'ml' ? '#3b82f6' : 'transparent', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Model Management
        </button>
        <button 
          onClick={() => setActiveTab('roles')}
          style={{ background: activeTab === 'roles' ? '#3b82f6' : 'transparent', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Access Roles
        </button>
        <button 
          onClick={() => setActiveTab('system')}
          style={{ background: activeTab === 'system' ? '#3b82f6' : 'transparent', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          System Config
        </button>
      </div>

      <div style={{ minHeight: '300px' }}>
        {activeTab === 'ml' && (
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px' }}>
            <h3>Active Machine Learning Models</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                <div>
                  <strong>LSTM Timeseries model</strong>
                  <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>v1.2.5 - Hot Reloaded yesterday</div>
                </div>
                <span style={{ color: '#22c55e' }}>Running</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                <div>
                  <strong>XGBoost Signal Optimizer</strong>
                  <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>v2.0.1 - Trained offline</div>
                </div>
                <span style={{ color: '#22c55e' }}>Running</span>
              </li>
            </ul>
            <button style={{ marginTop: '20px', background: '#3b82f6', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Trigger Retraining Pipeline</button>
          </div>
        )}

        {activeTab === 'roles' && (
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px' }}>
            <h3>User Role Configuration (JWT RS256)</h3>
            <p style={{ color: '#9ca3af' }}>Only Super Admins can assign roles.</p>
            <table style={{ width: '100%', textAlign: 'left', marginTop: '15px' }}>
              <thead>
                <tr style={{ color: '#94a3b8' }}>
                  <th style={{ paddingBottom: '10px' }}>User ID</th>
                  <th style={{ paddingBottom: '10px' }}>Name</th>
                  <th style={{ paddingBottom: '10px' }}>Role</th>
                  <th style={{ paddingBottom: '10px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 0' }}>USR-001</td>
                  <td>Anna K.</td>
                  <td>Admin</td>
                  <td><button>Edit</button></td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 0' }}>USR-002</td>
                  <td>Michael T.</td>
                  <td>Traffic Analyst</td>
                  <td><button>Edit</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'system' && (
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px' }}>
            <h3>System Scaling & Features</h3>
            <p style={{ color: '#9ca3af' }}>Configured via Redis & Bull Queues</p>
            <div style={{ marginTop: '15px', color: '#ccc' }}>
              <div>Polling Interval: <strong>60 Seconds (Override active: 15s)</strong></div>
              <div>Cache Provider: <strong>Redis v7</strong></div>
              <div>WebSockets Connected: <strong>1</strong></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
