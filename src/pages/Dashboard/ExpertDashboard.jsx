import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Star, Handshake, Calendar, Banknote, Video } from 'lucide-react';
import axiosClient from "../../api/axiosClient.js";
import toast from 'react-hot-toast';
import './dashboard.css';

export default function ExpertDashboard() {
    const { expertProfileId } = useParams();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('requests');
    const [acceptingBookingId, setAcceptingBookingId] = useState(null);
    const [meetingUrlInput, setMeetingUrlInput] = useState("");

    const fetchDashboard = async () => {
        try {
            // Adjust the URL if you get the expertId from a token context instead
            const response = await axiosClient.get(`/Dashboard/expert/${expertProfileId}`);
            setDashboardData(response.data?.data || response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (expertProfileId) {
            fetchDashboard();
        } else {
            console.error("expertId is undefined! Check your React Router path and Link.");
            setLoading(false);
            toast.error("Invalid Expert ID");
        }
    }, [expertProfileId]);

    // Handles Status Updates: 1=Accepted, 2=Rejected, 4=Completed
    const handleStatusUpdate = async (bookingId, newStatusId, actionName, meetingLink = null) => {
        if (newStatusId !== 1) { // If it's not 'Accept', just confirm normally
            if (!window.confirm(`Are you sure you want to ${actionName} this consultation?`)) return;
        }

        const toastId = toast.loading(`Processing...`);
        try {
            await axiosClient.put(`/Book/${bookingId}/status`, {
                newStatus: newStatusId,
                meetingLink: meetingLink // Send the link to the backend
            });

            toast.success(`Consultation ${actionName.toLowerCase()} successfully`, { id: toastId });

            // Reset inline UI state and refresh
            setAcceptingBookingId(null);
            setMeetingUrlInput("");
            fetchDashboard();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update status", { id: toastId });
        }
    };

    const confirmAcceptance = (bookingId) => {
        if (!meetingUrlInput.trim()) {
            toast.error("Please provide a valid meeting link.");
            return;
        }
        // Trigger the update with status 1 (Accepted) and pass the input URL
        handleStatusUpdate(bookingId, 1, 'Accept', meetingUrlInput);
    };

    if (loading) return <div className="dashboard-wrapper flex-center"><div className="container text-center pt-20">Loading dashboard...</div></div>;
    if (!dashboardData) return <div className="dashboard-wrapper flex-center"><div className="container text-center pt-20 text-red-500">Failed to load data.</div></div>;

    const formatDateTime = (dateString) => {
        const safeDateString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
        const date = new Date(safeDateString);
        return `${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} - ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    };

    // Calculate Badge Tier
        const gCount = dashboardData.guaranteesCount;
    const isGold = gCount >= 15;
    const isSilver = gCount >= 10 && gCount < 15;
    const isBronze = gCount >= 5 && gCount < 10;
    const isGreen = gCount >= 3 && gCount < 5;

    let badgeClass = '';
    let badgeText = '';
    if (isGold) { badgeClass = 'badge-gold'; badgeText = 'Gold Expert'; }
    else if (isSilver) { badgeClass = 'badge-silver'; badgeText = 'Silver Expert'; }
    else if (isBronze) { badgeClass = 'badge-bronze'; badgeText = 'Bronze Expert'; }
    else if (isGreen) { badgeClass = 'badge-green'; badgeText = 'Green Expert'; }

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
                        <h1>Expert Dashboard</h1>
                        <p>Manage your consultations and profile</p>
                    </div>

                    <div className="dash-header-actions">
                        <Link to={`/expert/${dashboardData.expertId}`} className="btn secondary-btn">
                            View My Profile
                        </Link>
                        {/* Dynamic Badge at the Top Right */}
                        {gCount >= 3 && (
                            <div className={`guarantee-badge-container ${badgeClass}`}>
                                <span className="dot"></span> {badgeText}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Grid (Updated for Expert) */}
                <div className="dash-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                    <div className="dash-stat-card">
                        <div className="dash-stat-icon">
                            <Star size={28} color="#f59e0b" fill="#f59e0b" />
                        </div>
                        <h3 className="dash-stat-value">{dashboardData.averageRating.toFixed(1)}</h3>
                        <p className="dash-stat-label">Average rating</p>
                    </div>

                    <div className="dash-stat-card">
                        <div className="dash-stat-icon" style={{ fontSize: '28px', lineHeight: 1 }}>
                            🤝
                        </div>
                        <h3 className="dash-stat-value">{dashboardData.guaranteesCount}</h3>
                        <p className="dash-stat-label">Client guarantees</p>
                    </div>

                    <div className="dash-stat-card">
                        <div className="dash-stat-icon">
                            <Calendar size={28} color="#6366f1" strokeWidth={1.5} />
                        </div>
                        <h3 className="dash-stat-value">{dashboardData.totalConsultations}</h3>
                        <p className="dash-stat-label">Total consultations</p>
                    </div>

                    <div className="dash-stat-card">
                        <div className="dash-stat-icon">
                            <Banknote size={30} color="#22c55e" strokeWidth={1.5} />
                        </div>
                        <h3 className="dash-stat-value">${dashboardData.basePrice}</h3>
                        <p className="dash-stat-label">Starting per session</p>
                    </div>
                </div>

                {/* Main Tab Area */}
                <div className="dash-content-card">
                    <div className="dash-tabs">
                        <button
                            className={`dash-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                            onClick={() => setActiveTab('requests')}
                        >
                            Consultation Requests {dashboardData.pendingRequests.length > 0 && <span className="dash-tab-badge">{dashboardData.pendingRequests.length}</span>}
                        </button>
                        <button
                            className={`dash-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                            onClick={() => setActiveTab('upcoming')}
                        >
                            Upcoming {dashboardData.upcomingConsultations.length > 0 && <span className="dash-tab-badge">{dashboardData.upcomingConsultations.length}</span>}
                        </button>
                        <button
                            className={`dash-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            History
                        </button>
                    </div>

                    <div className="dash-tab-body">
                        {/* PENDING REQUESTS TAB */}
                        {activeTab === 'requests' && (
                            dashboardData.pendingRequests.length > 0 ? (
                                <div className="dash-list">
                                    {dashboardData.pendingRequests.map((booking) => (
                                        <div key={booking.bookingId} className="dash-list-item">
                                            <div className="dash-item-profile">
                                                <Link to={`/profile/${booking.clientId}`}>
                                                <img src={booking.clientAvatar || `https://ui-avatars.com/api/?name=${booking.clientName}`} alt={booking.clientName} className="dash-item-avatar" />
                                                </Link>
                                                <div className="dash-item-details">
                                                    <h4>{booking.clientName}</h4>
                                                    <p className="meta-info">
                                                        {formatDateTime(booking.bookingTime)} • {booking.bookingDuration} minutes • ${booking.bookingPrice}
                                                    </p>
                                                </div>
                                            </div>

                                            {acceptingBookingId === booking.bookingId ? (
                                                <div className="dash-inline-form">
                                                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)' }}>Meeting Link</label>
                                                    <input
                                                        type="url"
                                                        className="dash-inline-input"
                                                        placeholder="https://meet.google.com/..."
                                                        value={meetingUrlInput}
                                                        onChange={(e) => setMeetingUrlInput(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <div className="dash-inline-actions">
                                                        <button className="btn secondary-btn" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => setAcceptingBookingId(null)}>
                                                            Cancel
                                                        </button>
                                                        <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => confirmAcceptance(booking.bookingId)}>
                                                            Save & Accept
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="dash-action-group">
                                                    <button className="btn btn-success" onClick={() => {
                                                        setAcceptingBookingId(booking.bookingId);
                                                        setMeetingUrlInput("");
                                                    }}>
                                                        Accept
                                                    </button>
                                                    <button className="btn danger-btn" onClick={() => handleStatusUpdate(booking.bookingId, 2, 'Decline')}>
                                                        Decline
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (<div className="text-center py-10 text-[var(--text-muted)]">No pending requests.</div>)
                        )}

                        {/* UPCOMING TAB */}
                        {activeTab === 'upcoming' && (
                            dashboardData.upcomingConsultations.length > 0 ? (
                                <div className="dash-list">
                                    {dashboardData.upcomingConsultations.map((booking) => (
                                        <div key={booking.bookingId} className="dash-list-item">
                                            <div className="dash-item-header">
                                                <div className="dash-item-profile">
                                                    <Link to={`/profile/${booking.clientId}`}>
                                                    <img src={booking.clientAvatar || `https://ui-avatars.com/api/?name=${booking.clientName}`} alt={booking.clientName} className="dash-item-avatar" />
                                                    </Link>
                                                    <div className="dash-item-details">
                                                        <h4>{booking.clientName}</h4>
                                                        <p className="meta-info">
                                                            {formatDateTime(booking.bookingTime)} • {booking.bookingDuration} minutes
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {booking.meetingLink && (
                                                <div className="dash-meeting-box">
                                                    <div className="dash-meeting-info">
                                                        <Video size={24} className="dash-meeting-icon" />
                                                        <div className="dash-meeting-text">
                                                            <h5>Meeting Room</h5>
                                                            <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer">{booking.meetingLink}</a>
                                                        </div>
                                                    </div>
                                                    {/* 4 = Completed */}
                                                    <div style={{display:"flex",gap:"12px"}}>
                                                    <button className="btn secondary-btn" onClick={() => handleStatusUpdate(booking.bookingId, 4, 'Mark as Completed')}>
                                                        Mark Completed
                                                    </button>
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
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (<div className="text-center py-10 text-[var(--text-muted)]">No upcoming consultations.</div>)
                        )}

                        {/* HISTORY TAB */}
                        {activeTab === 'history' && (
                            dashboardData.history.length > 0 ? (
                                <div className="dash-list">
                                    {dashboardData.history.map((booking) => (
                                        <div key={booking.bookingId} className="dash-list-item">
                                            <div className="dash-item-header">
                                                <div className="dash-item-profile">
                                                    <Link to={`/profile/${booking.clientId}`}>
                                                        <img src={booking.clientAvatar || `https://ui-avatars.com/api/?name=${booking.clientName}`} alt={booking.clientName} className="dash-item-avatar" />
                                                    </Link>
                                                    <div className="dash-item-details">
                                                        <h4>{booking.clientName}</h4>
                                                        <p className="meta-info">
                                                            {formatDateTime(booking.bookingTime)} • {booking.bookingDuration} minutes
                                                        </p>
                                                    </div>
                                                </div>

                                                <span className={`status-badge ${
                                                    String(booking.bookingStatus) === '4' ? 'badge-completed' : 'badge-cancelled'
                                                }`}>
                                                    {String(booking.bookingStatus) === '4' ? 'Completed' :
                                                        String(booking.bookingStatus) === '5' ? 'Cancelled by Client' : 'Rejected'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (<div className="text-center py-10 text-[var(--text-muted)]">No historical records found.</div>)
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}