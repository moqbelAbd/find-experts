import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, Menu, X } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import './navbar.css';
import { useState } from "react";

export default function Navbar() {
    const { user, token, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
    const closeMenu = () => setMobileMenuOpen(false);

    return (
        <nav className="navbar-container">
            <div className="nav-left">
                <Link to="/" className="nav-brand" onClick={closeMenu}>
                    <div className="logo-box">RE</div>
                    Rent an Expert
                </Link>
            </div>

            <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                {token ? (
                    <>
                        <NavLink to="/dashboard" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            Home
                        </NavLink>
                        <NavLink to="/experts" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            Find Experts
                        </NavLink>
                        <NavLink to="/posts" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            Posts
                        </NavLink>
                        <NavLink to="/consult" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            Consult
                        </NavLink>
                    </>
                ) : (
                    <>
                        <NavLink to="/how-it-works" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            How It Works
                        </NavLink>
                        <NavLink to="/experts" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            Find Experts
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

                            <ProfileDropdown user={user} logout={logout} />
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