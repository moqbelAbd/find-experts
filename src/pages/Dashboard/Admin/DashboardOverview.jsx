import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Calendar, DollarSign, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axiosClient from "../../../api/axiosClient.js";
import toast from 'react-hot-toast';

export default function DashboardOverview() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await axiosClient.get('/Dashboard/admin/overview');
                setDashboardData(response.data?.data || response.data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load overview data.");
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    if (loading) return <div className="text-center py-20 text-[var(--text-muted)]">Loading overview data...</div>;
    if (!dashboardData) return <div className="text-center py-20 text-[var(--danger)]">Failed to load data.</div>;

    const renderGrowth = (growth) => {
        const isPositive = growth >= 0;
        return (
            <p className={`growth-text ${isPositive ? 'growth-positive' : 'growth-negative'}`}>
                {isPositive ? '+' : ''}{growth}% vs last month
            </p>
        );
    };

    const gStats = dashboardData.expertGuarantees;
    const totalGuarantees = gStats.totalGuarantees || 0;

    // Filter out 0s, but if it's completely empty, provide a gray placeholder ring
    let pieData = [
        { name: 'Green', value: gStats.greenCount, fill: '#22c55e' },
        { name: 'Bronze', value: gStats.bronzeCount, fill: '#d97706' },
        { name: 'Gold', value: gStats.goldCount, fill: '#eab308' },
        { name: 'Silver', value: gStats.silverCount, fill: '#94a3b8' },
    ].filter(item => item.value > 0);

    if (pieData.length === 0) {
        pieData = [{ name: 'No Data', value: 1, fill: '#f3f4f6' }];
    }

    const calculatePercentage = (value) => {
        if (totalGuarantees === 0) return 0;
        return Math.round((value / totalGuarantees) * 100);
    };

    return (
        <div>
            {/* Stats Grid */}
            <div className="dash-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="dash-stat-card">
                    <div className="dash-stat-icon"><Users size={24} color="#10b981" /></div>
                    <h3 className="dash-stat-value">{dashboardData.totalUsers.value.toLocaleString()}</h3>
                    <p className="dash-stat-label">Total Users</p>
                    {renderGrowth(dashboardData.totalUsers.growthPercentage)}
                </div>

                <div className="dash-stat-card">
                    <div className="dash-stat-icon"><Briefcase size={24} color="#8b5cf6" /></div>
                    <h3 className="dash-stat-value">{dashboardData.activeExperts.value.toLocaleString()}</h3>
                    <p className="dash-stat-label">Active Experts</p>
                    {renderGrowth(dashboardData.activeExperts.growthPercentage)}
                </div>

                <div className="dash-stat-card">
                    <div className="dash-stat-icon"><Calendar size={24} color="#3b82f6" /></div>
                    <h3 className="dash-stat-value">{dashboardData.totalBookings.value.toLocaleString()}</h3>
                    <p className="dash-stat-label">Bookings</p>
                    {renderGrowth(dashboardData.totalBookings.growthPercentage)}
                </div>

                <div className="dash-stat-card">
                    <div className="dash-stat-icon"><DollarSign size={24} color="#22c55e" /></div>
                    <h3 className="dash-stat-value">${dashboardData.totalRevenue.value.toLocaleString()}</h3>
                    <p className="dash-stat-label">Revenue</p>
                    {renderGrowth(dashboardData.totalRevenue.growthPercentage)}
                </div>

                <div className="dash-stat-card">
                    <div className="dash-stat-icon"><MessageSquare size={24} color="#f59e0b" /></div>
                    <h3 className="dash-stat-value">{dashboardData.openPosts.value.toLocaleString()}</h3>
                    <p className="dash-stat-label">Open Posts</p>
                    {renderGrowth(dashboardData.openPosts.growthPercentage)}
                </div>
            </div>

            {/* Charts Grid */}
            <div className="dash-chart-grid">

                {/* Bar Chart: Monthly Bookings */}
                <div className="dash-chart-card">
                    <h3>Monthly Bookings</h3>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dashboardData.monthlyBookings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                                <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                                <Bar dataKey="total" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut Chart: Expert Guarantees */}
                <div className="dash-chart-card">
                    <h3>Experts Guarantees</h3>
                    <div className="chart-container-wrapper">

                        <div className="donut-wrapper">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    />
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="donut-center-text">
                                <span className="donut-center-value">{totalGuarantees}</span>
                                <span className="donut-center-label">total</span>
                            </div>
                        </div>

                        <div className="donut-legend">
                            {pieData[0].name === 'No Data' ? (
                                <div className="text-sm text-gray-400">No guarantee badges yet</div>
                            ) : (
                                pieData.map((item, index) => (
                                    <div key={index} className="donut-legend-item">
                                        <div className="legend-label-group" >
                                            <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                                            {item.name}
                                        </div>
                                        <div style={{display:'contents'}}>
                                            <span style={{ display: 'block' }}>{item.value.toLocaleString()}</span>
                                            <span className="legend-percentages">{calculatePercentage(item.value)}%</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}