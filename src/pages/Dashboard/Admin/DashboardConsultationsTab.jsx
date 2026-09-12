import React, { useState, useEffect } from 'react';
import {Link} from "react-router-dom"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import axiosClient from "../../../api/axiosClient.js";
import toast from 'react-hot-toast';

export default function DashboardConsultationsTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosClient.get('/Dashboard/admin/consultations');
                setData(response.data?.data || response.data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load consultations data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter]);

    if (loading) return <div className="text-center py-20 text-[var(--text-muted)]">Loading consultations...</div>;
    if (!data) return <div className="text-center py-20 text-[var(--danger)]">Failed to load data.</div>;

    const total = data.totalBookings;
    const calcPercent = (val) => total === 0 ? 0 : Math.round((val / total) * 100);

    // Map UI statuses to Enum Values and Colors
    const statuses = [
        { key: 'completed', label: 'Completed', value: data.completed, color: '#22c55e', enumStr: '4' }, // Green
        { key: 'pending', label: 'Pending', value: data.pending, color: '#f59e0b', enumStr: '3' },     // Amber
        { key: 'accepted', label: 'Accepted', value: data.accepted, color: '#3b82f6', enumStr: '1' },   // Blue
        { key: 'cancelled', label: 'Cancelled', value: data.cancelled, color: '#ef4444', enumStr: '5' }, // Red
        { key: 'declined', label: 'Declined', value: data.rejected, color: '#9ca3af', enumStr: '2' }     // Gray (Mapped from Rejected)
    ];

    let pieData = statuses.filter(s => s.value > 0).map(s => ({ ...s, fill: s.color }));
    if (pieData.length === 0) pieData = [{ label: 'No Data', value: 1, fill: '#f3f4f6' }];

    // Filter Table Data
    const filteredBookings = data.bookings.filter(b => {
        if (activeFilter === 'all') return true;
        const targetStatus = statuses.find(s => s.key === activeFilter);
        return String(b.bookingStatus) === targetStatus?.enumStr || String(b.bookingStatus).toLowerCase() === targetStatus?.label.toLowerCase();
    });


    //  Paginate Data
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

    // Formatting Helpers
    const formatDateTime = (dateString) => {
        const safeDate = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
        return new Date(safeDate).toISOString().split('T')[0]; // Returns YYYY-MM-DD
    };

    const getStatusStyles = (status) => {
        const s = String(status).toLowerCase();
        if (s === 'completed' || s === '4') return 'badge-confirmed'; // Reusing your green badge
        if (s === 'pending' || s === '3') return 'badge-pending';
        if (s === 'accepted' || s === '1') return 'bg-blue-100 text-blue-800'; // Custom blue
        if (s === 'cancelled' || s === '5') return 'badge-cancelled';
        if (s === 'rejected' || s === '2') return 'bg-gray-100 text-gray-700'; // Gray for declined
        return 'badge-default';
    };

    const getStatusText = (status) => {
        const s = String(status);
        if (s === '4' || s.toLowerCase() === 'completed') return 'Completed';
        if (s === '3' || s.toLowerCase() === 'pending') return 'Pending';
        if (s === '1' || s.toLowerCase() === 'accepted') return 'Accepted';
        if (s === '5' || s.toLowerCase() === 'cancelled') return 'Cancelled';
        if (s === '2' || s.toLowerCase() === 'rejected') return 'Declined';
        return status;
    };

    return (
        <div>
            {/* Top Section: Donut + Stat Cards */}
            <div className="consult-top-section">

                {/* Donut Chart Card */}
                <div className="dash-chart-card">
                    <h3>Status Distribution</h3>
                    <div className="chart-container-wrapper" style={{ height: '220px' }}>
                        <div className="donut-wrapper">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    />
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="donut-center-text">
                                <span className="donut-center-value">{total}</span>
                                <span className="donut-center-label">total</span>
                            </div>
                        </div>

                        <div className="donut-legend" style={{ width: '50%' }}>
                            {statuses.map((item, index) => (
                                <div key={index} className="donut-legend-item" style={{ marginBottom: '8px' }}>
                                    <div className="legend-label-group">
                                        <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                                        {item.label}
                                    </div>
                                    <div style={{ fontWeight: 'bold' }}>{item.value.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stat Cards Grid */}
                <div className="consult-stat-grid">
                    {statuses.map(stat => (
                        <div key={stat.key} className="consult-stat-card">
                            <span className="dot-indicator" style={{ backgroundColor: stat.color }}></span>
                            <span className="consult-stat-val">{stat.value.toLocaleString()}</span>
                            <span className="consult-stat-name">{stat.label}</span>
                            <span className="consult-stat-percent">{calcPercent(stat.value)}% of total</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="admin-filter-bar">
                <span className="admin-filter-label">Filter:</span>
                <button className={`admin-filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
                    All
                </button>
                {statuses.map(stat => (
                    <button
                        key={stat.key}
                        className={`admin-filter-btn ${activeFilter === stat.key ? 'active' : ''}`}
                        onClick={() => setActiveFilter(stat.key)}
                    >
                        {stat.label}
                    </button>
                ))}
            </div>

            {/* Data Table */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>User</th>
                        <th>Expert</th>
                        <th>Date</th>
                        <th>Duration</th>
                        <th>Price</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentBookings.length > 0 ? (
                        currentBookings.map(booking => (
                            <tr key={booking.bookingId}>

                                <td style={{ fontWeight: 500 }}><Link to={`/profile/${booking.clientId}`} style={{color:"black"}}>
                                {booking.clientName}  </Link>  </td>

                                <td> <Link to={`/expert/${booking.expertId}`}  style={{color:"black"}}>
                                {booking.expertName} </Link> </td>

                                <td>{formatDateTime(booking.bookingTime)}</td>
                                <td>{booking.bookingDuration} min</td>
                                <td style={{ fontWeight: 600 }}>${booking.bookingPrice}</td>
                                <td>
                                        <span className={`status-badge ${getStatusStyles(booking.bookingStatus)}`}>
                                            {getStatusText(booking.bookingStatus)}
                                        </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                No consultations found for this filter.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>

                {/* Pagination Footer */}
                {totalPages > 0 && (
                    <div className="admin-pagination">
                        <div className="pagination-info">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBookings.length)} of {filteredBookings.length} entries
                        </div>
                        <div className="pagination-controls">
                            <button
                                className="pagination-btn"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            >
                                Previous
                            </button>
                            <button
                                className="pagination-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}