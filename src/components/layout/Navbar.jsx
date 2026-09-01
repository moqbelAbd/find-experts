import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, ChevronDown } from 'lucide-react';
import './navbar.css';

export default function Navbar() {
    const { user, token, logout } = useAuth();

    return (
        <nav className="navbar-container">
            <div className="nav-left">
                <Link to="/" className="nav-brand">
                    <div className="logo-box">RE</div>
                    Rent an Expert
                </Link>
            </div>

                {/* Dynamic Center Links */}
                <div className="nav-links">
                    {token ? (
                        <>
                            <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                Home
                            </NavLink>
                            <NavLink to="/experts" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                Find Experts
                            </NavLink>
                            <NavLink to="/posts" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                Posts
                            </NavLink>
                            <NavLink to="/consult" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                Consult
                            </NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink to="/how-it-works" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                How It Works
                            </NavLink>
                            <NavLink to="/experts" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                Find Experts
                            </NavLink>
                        </>
                    )}
                </div>

            <div className="nav-right">
                {/* Dynamic Right Actions */}
                <div className="nav-actions">
                    {token ? (
                        <>
                            <div className="notification-bell">
                                <Bell size={20} />
                                <span className="notification-badge">2</span>
                            </div>

                            <div className="user-profile" onClick={logout} title="Click to logout">
                                <img
                                    src={user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.fullName || "User") + "&background=F1FAF6&color=12372A"}
                                    alt="Avatar"
                                    className="avatar"
                                />
                                <span className="user-name">
                  {user?.fullName?.split(' ')[0] || "User"} <ChevronDown size={16} color="var(--text-muted)" />
                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn-login">Log in</Link>
                            <Link to="/register" className="btn-get-started">Get started</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}