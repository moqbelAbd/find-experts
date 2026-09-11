import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckSquare, Hourglass, Video } from 'lucide-react';
import axiosClient from "../../api/axiosClient.js";
import toast from 'react-hot-toast';
import './dashboard.css';

export default function UserDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // Changed default tab to 'all'

    // Extracted fetch function so we can refresh after cancelling
    const fetchDashboard = async () => {
        try {
            const response = await axiosClient.get('/Dashboard');
            setDashboardData(response.data?.data || response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        const newStatus = 5;
        const toastId = toast.loading("Cancelling booking...");
        try {
            await axiosClient.put(`/Book/${bookingId}/status`,
                {newStatus: newStatus} );

            toast.success("Booking cancelled successfully", { id: toastId });
            fetchDashboard();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to cancel booking", { id: toastId });
        }
    };

    if (loading) {
        return (
            <div className="dashboard-wrapper flex-center">
                <div className="container" style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '100px' }}>
                    Loading dashboard...
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="dashboard-wrapper">
                <div className="container" style={{ textAlign: 'center', color: 'var(--danger)', paddingTop: '100px' }}>
                    Failed to load data.
                </div>
            </div>
        );
    }

    const formatDateTime = (dateString) => {
        const safeDateString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
        const date = new Date(safeDateString);
        const datePart = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        const timePart = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return `${datePart} - ${timePart}`;
    };

    const getStatusClass = (status) => {
        const normalized = String(status).toLowerCase();
        if (normalized === 'accepted' || normalized === '1') return 'badge-confirmed';
        if (normalized === 'rejected' || normalized === '2') return 'badge-cancelled'; // Reuse danger style
        if (normalized === 'pending' || normalized === '3') return 'badge-pending';
        if (normalized === 'completed' || normalized === '4') return 'badge-completed';
        if (normalized === 'cancelled' || normalized === '5') return 'badge-cancelled';
        return 'badge-default';
    };

    const formatStatusText = (status) => {

        const str = String(status);
        if (str === '1') return 'Accepted';
        if (str === '2') return 'Rejected';
        if (str === '3') return 'Pending';
        if (str === '4') return 'Completed';
        if (str === '5') return 'Cancelled';
        return status; // Returns the string exactly as sent by backend
    };

    // Filter logic for tabs
    const filteredBookings = dashboardData.historyItem?.filter(booking => {
        const statusStr = String(booking.bookingStatus).toLowerCase();
        if (activeTab === 'all') return true;
        if (activeTab === 'pending') return statusStr === 'pending' || statusStr === '3';
        if (activeTab === 'accepted') return statusStr === 'accepted' || statusStr === '1';
        if (activeTab === 'completed') return statusStr === 'completed' || statusStr === '4';
        if (activeTab === 'cancelled') return statusStr === 'cancelled' || statusStr === '5' || statusStr === 'rejected' || statusStr === '2';
        return true;
    }) || [];

    //  Calculate counts for the badges
    const counts = {
        all: dashboardData.historyItem?.length || 0,
        pending: dashboardData.historyItem?.filter(b => String(b.bookingStatus).toLowerCase() === 'pending' || String(b.bookingStatus) === '3').length || 0,
        accepted: dashboardData.historyItem?.filter(b => String(b.bookingStatus).toLowerCase() === 'accepted' || String(b.bookingStatus) === '1').length || 0,
        completed: dashboardData.historyItem?.filter(b => String(b.bookingStatus).toLowerCase() === 'completed' || String(b.bookingStatus) === '4').length || 0,
        cancelled: dashboardData.historyItem?.filter(b => {
            const s = String(b.bookingStatus).toLowerCase();
            return s === 'cancelled' || s === '5' || s === 'rejected' || s === '2';
        }).length || 0
    };

    // Checks if the current time is within 1 hour of the meeting start time
    const canJoinMeeting = (dateString) => {
        const safeDateString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
        const meetingTime = new Date(safeDateString).getTime();
        const now = new Date().getTime();
        const oneHourInMs = 60 * 60 * 1000;

        return now >= (meetingTime - oneHourInMs);
    };

    return (
        <div className="dashboard-wrapper">
            <div className="container">

                {/* Header Area */}
                <div className="dash-header">
                    <div className="dash-title-group">
                        <h1>My Dashboard</h1>
                        <p>Track your activity, bookings, and history</p>
                    </div>

                    <div className="dash-header-actions">

                        <div className="dash-user-profile">
                            <img
                                src={dashboardData.userAvatar || `https://ui-avatars.com/api/?name=${dashboardData.userName}`}
                                alt={dashboardData.userName}
                                className="dash-user-avatar"
                            />
                            <div className="dash-user-meta">
                                <h4>{dashboardData.userName}</h4>
                                <p>{dashboardData.userEmail}</p>
                            </div>
                        </div>

                        {dashboardData.userExpertProfileId && (
                            <Link to={`/expert-dashboard/${dashboardData.userExpertProfileId}`} className="btn secondary-btn">
                                Expert Dashboard
                            </Link>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="dash-stats-grid">
                    <div className="dash-stat-card">
                        <div className="dash-stat-icon">
                            <Calendar size={28} color="#6366f1" strokeWidth={1.5} />
                        </div>
                        <h3 className="dash-stat-value">{dashboardData.totalBookings}</h3>
                        <p className="dash-stat-label">Total Bookings</p>
                    </div>

                    <div className="dash-stat-card">
                        <div className="dash-stat-icon">
                            <Clock size={28} color="#f43f5e" strokeWidth={1.5} />
                        </div>
                        <h3 className="dash-stat-value">{dashboardData.upcomingBookings}</h3>
                        <p className="dash-stat-label">Upcoming</p>
                    </div>

                    <div className="dash-stat-card">
                        <div className="dash-stat-icon">
                            <CheckSquare size={28} color="#22c55e" strokeWidth={1.5} />
                        </div>
                        <h3 className="dash-stat-value">{dashboardData.completedBookings}</h3>
                        <p className="dash-stat-label">Completed</p>
                    </div>

                    <div className="dash-stat-card">
                        <div className="dash-stat-icon">
                            <Hourglass size={28} color="#f59e0b" strokeWidth={1.5} />
                        </div>
                        <h3 className="dash-stat-value">{dashboardData.pendingBookings}</h3>
                        <p className="dash-stat-label">Pending</p>
                    </div>
                </div>

                {/* Main Tab Area */}
                <div className="dash-content-card">
                    <div className="dash-tabs">
                        <button
                            className={`dash-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All Bookings <span className="dash-tab-badge">{counts.all}</span>
                        </button>
                        <button
                            className={`dash-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                            onClick={() => setActiveTab('pending')}
                        >
                            Pending {counts.pending > 0 && <span className="dash-tab-badge">{counts.pending}</span>}
                        </button>
                        <button
                            className={`dash-tab-btn ${activeTab === 'accepted' ? 'active' : ''}`}
                            onClick={() => setActiveTab('accepted')}
                        >
                            Accepted {counts.accepted > 0 && <span className="dash-tab-badge">{counts.accepted}</span>}
                        </button>
                        <button
                            className={`dash-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                            onClick={() => setActiveTab('completed')}
                        >
                            Completed {counts.completed > 0 && <span className="dash-tab-badge">{counts.completed}</span>}
                        </button>
                        <button
                            className={`dash-tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
                            onClick={() => setActiveTab('cancelled')}
                        >
                            Cancelled / Rejected {counts.cancelled > 0 && <span className="dash-tab-badge">{counts.cancelled}</span>}
                        </button>
                    </div>

                    <div className="dash-tab-body">
                        {filteredBookings.length > 0 ? (
                            <div className="dash-list">
                                {filteredBookings.map((booking) => {
                                    // Using the new Enum logic
                                    const statusStr = String(booking.bookingStatus).toLowerCase();
                                    const isPending = statusStr === 'pending' || statusStr === '3';
                                    const isAccepted = statusStr === 'accepted' || statusStr === '1';

                                    return (
                                        <div key={booking.bookingId} className="dash-list-item">

                                            <div className="dash-item-header">
                                                <div className="dash-item-profile">

                                                    <Link to={`/expert/${booking.consultantId}`} className="avatar-link-wrapper">                                                    <img
                                                        src={booking.consultantAvatar || `https://ui-avatars.com/api/?name=${booking.consultantName}`}
                                                        alt={booking.consultantName}
                                                        className="dash-item-avatar"
                                                    />
                                                    </Link>

                                                    <div className="dash-item-details">
                                                        <h4>{booking.consultantName}</h4>
                                                        <p className="job-title">{booking.consultantJobTitle}</p>
                                                        <p className="meta-info">
                                                            {formatDateTime(booking.bookingTime)} • {booking.bookingDuration} min • ${booking.bookingPrice}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span className={`status-badge ${getStatusClass(booking.bookingStatus)}`}>
                                                    {formatStatusText(booking.bookingStatus)}
                                                </span>
                                            </div>

                                            {/* Meeting Box (Only show if Accepted and has a link) */}
                                            {booking.meetingLink && isAccepted && (
                                                <div className="dash-meeting-box">
                                                    <div className="dash-meeting-info">
                                                        <Video size={24} className="dash-meeting-icon" />
                                                        <div className="dash-meeting-text">
                                                            <h5>Consultation Accepted</h5>
                                                            <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer">
                                                                {booking.meetingLink}
                                                            </a>
                                                        </div>
                                                    </div>
                                                    {canJoinMeeting(booking.bookingTime) ? (
                                                        <a
                                                            href={booking.meetingLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn primary-btn"
                                                        >
                                                            Join
                                                        </a>
                                                    ) : (
                                                        <button
                                                            className="btn primary-btn"
                                                            disabled
                                                            title="The meeting link will be active 1 hour before the start time."
                                                        >
                                                            Available Soon
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Cancel Action (Only show for pending bookings) */}
                                            {isPending && (
                                                <div className="dash-item-footer">
                                                    <button
                                                        className="btn danger-btn"
                                                        style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                                                        onClick={() => handleCancelBooking(booking.bookingId)}
                                                    >
                                                        Cancel Booking
                                                    </button>
                                                </div>
                                            )}

                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                                No bookings found in this category.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}