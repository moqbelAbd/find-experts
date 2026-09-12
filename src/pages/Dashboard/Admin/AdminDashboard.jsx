import React, { useState } from 'react';
import './admin-dashboard.css';
import '../dashboard.css';
import DashboardOverview from "./DashboardOverview.jsx";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="dashboard-wrapper">
            <div className="container">

                {/* Header */}
                <div className="dash-header">
                    <div className="dash-title-group">
                        <h1>Admin Dashboard</h1>
                    </div>
                </div>

                {/* Tabs Container */}
                <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '32px' }}>
                    <div className="dash-tabs" style={{ padding: 0, borderBottom: 'none' }}>
                        <button
                            className={`dash-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button
                            className={`dash-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            Users & Experts
                        </button>
                        <button
                            className={`dash-tab-btn ${activeTab === 'consultations' ? 'active' : ''}`}
                            onClick={() => setActiveTab('consultations')}
                        >
                            Consultations
                        </button>
                    </div>
                </div>

                {/* Tab Content Routing */}
                {activeTab === 'overview' && <DashboardOverview />}

                {activeTab === 'users' && (
                    <div className="dash-chart-card text-center" style={{ padding: '60px', color: 'var(--text-muted)' }}>
                        Users & Experts Tab (Coming soon)
                    </div>
                )}

                {activeTab === 'consultations' && (
                    <div className="dash-chart-card text-center" style={{ padding: '60px', color: 'var(--text-muted)' }}>
                        Consultations Tab (Coming soon)
                    </div>
                )}

            </div>
        </div>
    );
}