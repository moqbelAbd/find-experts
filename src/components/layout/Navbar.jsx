import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, Menu, X } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import './navbar.css';
import logo from "../../assets/Logo/platform logo.png";

import React, { useState } from "react";
import {getUserIdFromToken} from "../../utils/authUtils.js";

export default function Navbar() {
    const { user, token, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
    const closeMenu = () => setMobileMenuOpen(false);
    const userId = getUserIdFromToken();

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
                    <>
                        <NavLink to="/dashboard" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
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
                ) : (
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

                            <div className="logout-container">
                                <button
                                    onClick={() => logout() }
                                    className="btn-logout"
                                >
                                    Log out
                                </button>
                            </div>

                            <NavLink to={`/profile/${userId}`} onClick={closeMenu} className= "header-avatar" >
                            <img
                                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.fullName || "User"}&background=F1FAF6&color=12372A`}
                                alt="Avatar"
                                className="avatar"
                            />
                            </NavLink>
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