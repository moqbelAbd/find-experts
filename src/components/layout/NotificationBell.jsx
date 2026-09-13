import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Info } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import './NotificationBell.css';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch Notifications on load
    useEffect(() => {
        fetchNotifications();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axiosClient.get('/Notifications');
            setNotifications(res.data?.data || res.data || []);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const handleDeleteSingle = async (e, id) => {
        e.stopPropagation(); // Prevents the dropdown from closing if clicking inside
        try {
            await axiosClient.delete(`/Notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.notificationId !== id));
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete notification.");
        }
    };

    const handleClearAll = async () => {
        try {
            await axiosClient.delete('/Notifications');
            setNotifications([]);
        } catch (error) {
            console.error(error);
            toast.error("Failed to clear notifications.");
        }
    };

    const toggleDropdown = () => setIsOpen(!isOpen);

    return (
        <div className="notification-wrapper" ref={dropdownRef}>
            {/* Bell Icon Trigger */}
            <div className="notification-bell" onClick={toggleDropdown}>
                <Bell size={20} />
                {notifications.length > 0 && (
                    <span className="notification-badge">
                        {notifications.length > 99 ? '99+' : notifications.length}
                    </span>
                )}
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        {notifications.length > 0 && (
                            <button className="clear-all-btn" onClick={handleClearAll}>
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="notification-empty">
                                <Info size={32} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
                                <p>You have no new notifications.</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.notificationId} className={`notification-item ${!n.isRead ? 'unread' : ''}`}>
                                    <div className="notification-content">
                                        <div className="notification-title">{n.notificationTitle}</div>
                                        <div className="notification-text">{n.notificationText}</div>
                                        <div className="notification-time">
                                            {new Date(n.createdAt).toLocaleDateString([], {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                    <button
                                        className="delete-notification-btn"
                                        onClick={(e) => handleDeleteSingle(e, n.notificationId)}
                                        title="Delete notification"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}