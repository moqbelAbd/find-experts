import React, { useState, useEffect } from 'react';
import axiosClient from "../../../api/axiosClient.js";
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function DashboardUsersTab() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All'); // All, Users, Experts

    // Pagination (Optional, reusing logic from Consultations tab)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchUsers = async () => {
        try {
            const response = await axiosClient.get('/Dashboard/admin/users');
            setUsers(response.data?.data || response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load users data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeFilter]);


    const handleSuspend = async (userId, currentStatus, userName) => {
        const isBanned = currentStatus.toLowerCase() === 'banned';
        const action = isBanned ? 'activate' : 'suspend';

        if (!window.confirm(`Are you sure you want to ${action} ${userName}?`)) return;

        const toastId = toast.loading(`${isBanned ? 'Activating' : 'Suspending'} user...`);
        try {
            if (isBanned)
                 await axiosClient.put(`/Admin/users/${userId}/activate`);
            else
                await axiosClient.put(`/Admin/users/${userId}/suspend`);

            toast.success(`User successfully ${isBanned ? 'activated' : 'suspended'}`, { id: toastId });

            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || `Failed to ${action} user`, { id: toastId });
        }
    };

    if (loading) return <div className="text-center py-20 text-[var(--text-muted)]">Loading users...</div>;

    // Apply Filters (Search text + Role)
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = activeFilter === 'All' ||
            (activeFilter === 'Users' && user.role === 'User') ||
            (activeFilter === 'Experts' && user.role === 'Expert');

        return matchesSearch && matchesRole;
    });

    // Apply Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

    // Helpers
    const formatJoinedDate = (dateString) => {
        const date = new Date(dateString.endsWith('Z') ? dateString : `${dateString}Z`);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); // e.g., "Mar 2024"
    };

    const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'U';

    return (
        <div>
            {/* Toolbar: Search, Filters, Results Count */}
            <div className="users-toolbar">
                <div className="users-toolbar-left">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="admin-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <div>
                        {['All', 'Users', 'Experts'].map(filter => (
                            <button
                                key={filter}
                                className={`admin-filter-btn ${activeFilter === filter ? 'active' : ''}`}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="results-count">
                    {filteredUsers.length} results
                </div>
            </div>

            {/* Data Table */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>User</th>
                        <th>Location</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentUsers.length > 0 ? (
                        currentUsers.map(user => {
                            const isBanned = user.status.toLowerCase() === 'banned';

                            return (
                                <tr key={user.userId}>
                                    <td>
                                        <div className="user-info-cell">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.fullName} className="user-avatar-small" />
                                            ) : (
                                                <div className="user-avatar-small">{getInitials(user.fullName)}</div>
                                            )}
                                            <div>
                                                <div className="user-name-text">{user.fullName}</div>
                                                <div className="user-email-text">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>{user.location || '—'}</td>
                                    <td>
                                            <span className={`role-badge ${user.role === 'Expert' ? 'role-expert' : 'role-user'}`}>
                                                {user.role}
                                            </span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>{formatJoinedDate(user.joinedAt)}</td>
                                    <td>
                                            <span className={`status-badge-outline ${isBanned ? 'status-suspended-outline' : 'status-active-outline'}`}>
                                                {user.status}
                                            </span>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <Link to={`/profile/${user.userId}`} className="btn-table-action btn-view">
                                                View
                                            </Link>

                                            {/* Dynamic Action Button */}
                                            {isBanned ? (
                                                <button
                                                    className="btn-table-action"
                                                    style={{ border: '1px solid var(--success)', color: 'var(--success)' }}
                                                    onClick={() => handleSuspend(user.userId, user.status, user.fullName)}
                                                >
                                                    Activate
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn-table-action btn-suspend"
                                                    onClick={() => handleSuspend(user.userId, user.status, user.fullName)}
                                                >
                                                    Suspend
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                No users found matching your criteria.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>


                {/* Pagination Footer */}
                {totalPages > 0 && (
                    <div className="admin-pagination">
                        <div className="pagination-info">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} entries
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