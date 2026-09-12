import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, MessageSquare, Menu, X } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import './navbar.css';
import logo from "../../assets/Logo/platform logo.png";

import React, { useState } from "react";
import {getUserIdFromToken} from "../../utils/authUtils.js";
import {jwtDecode} from "jwt-decode";

export default function Navbar() {
    const { user, token, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    let isAdmin = false;
    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            const roleClaimKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
            const userRoles = decodedToken[roleClaimKey] || decodedToken.role || [];
            isAdmin = Array.isArray(userRoles) ? userRoles.includes('Admin') : userRoles === 'Admin';
        } catch (error) {
            console.error("Failed to decode token", error);
        }
    }

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
    const closeMenu = () => setMobileMenuOpen(false);

    const userId = token ? getUserIdFromToken() : null;

    return (
        <nav className="navbar-container">
            <div className="nav-left">
                <Link to="/" className="nav-brand" onClick={closeMenu}>
                    <img className="nav-logo"
                         src={logo}
                         alt="Expert video consultation and workspace"
                    />
                </Link>
            </div>

            <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                {token ? (
                    isAdmin ? (
                        /* --- ADMIN LINKS --- */
                        <>
                            <NavLink to="/admin-dashboard" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                Admin Dashboard
                            </NavLink>
                            <NavLink to="/how-it-works" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                How It Works
                            </NavLink>
                            <NavLink to="/find-experts" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                Find Experts
                            </NavLink>
                            <NavLink to="/posts" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                Posts
                            </NavLink>
                        </>
                    ) : (
                        /* --- NORMAL LOGGED-IN USER LINKS --- */
                        <>
                            <NavLink to="/user-dashboard" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                Dashboard
                            </NavLink>
                            <NavLink to={`/profile/${userId}`} onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                My Profile
                            </NavLink>
                            <NavLink to="/find-experts" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                Find Experts
                            </NavLink>
                            <NavLink to="/posts" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                Posts
                            </NavLink>
                        </>
                    )
                ) : (
                    /* --- GUEST LINKS (Not Logged In) --- */
                    <>
                        <NavLink to="/how-it-works" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            How It Works
                        </NavLink>
                        <NavLink to="/find-experts" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            Find Experts
                        </NavLink>
                        <NavLink to="/posts" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            Posts
                        </NavLink>
                    </>
                )}
            </div>

            <div className="nav-right">
                <div className="nav-actions">
                    {token ? (
                        <>
                            <div className="notification-bell">
                                <Bell size={20} />
                                <span className="notification-badge">2</span>
                            </div>
                            <Link to="/chats" >
                                <MessageSquare size={20} />
                            </Link>
                            <div className="logout-container">
                                <button
                                    onClick={() => logout() }
                                    className="btn-logout"
                                >
                                    Log out
                                </button>
                            </div>

                            {/*<NavLink to={`/profile/${userId}`} onClick={closeMenu} className= "header-avatar" >*/}
                            {/*<img*/}
                            {/*    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.fullName || "User"}&background=F1FAF6&color=12372A`}*/}
                            {/*    alt="Avatar"*/}
                            {/*    className="avatar"*/}
                            {/*/>*/}
                            {/*</NavLink>*/}

                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <Link to="/login" style={{ color: 'var(--text-main)', fontWeight: '500' }}>
                                Log in
                            </Link>
                            <Link to="/register" className="btn primary-btn">
                                Get started
                            </Link>
                        </div>
                    )}
                </div>

                <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </nav>
    );
}