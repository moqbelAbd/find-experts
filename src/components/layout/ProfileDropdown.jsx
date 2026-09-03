import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import "./profileDropdown.css"

export default function ProfileDropdown({ user, logout }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

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

    const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : 'U';
    const firstName = user?.fullName?.split(' ')[0] || "User";

    return (
        <div className="dropdown-container" ref={dropdownRef}>
            <div
                className="user-profile"
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: 'pointer' }}
            >
                <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.fullName || "User"}&background=F1FAF6&color=12372A`}
                    alt="Avatar"
                    className="avatar"
                />
                <span className="user-name">
                {firstName} <ChevronDown size={16} color="var(--text-muted)" />
            </span>
            </div>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-header">
                        <p className="dropdown-name">{user?.fullName}</p>
                        <p className="dropdown-email">{user?.email}</p>
                    </div>

                    <div className="dropdown-links">
                        <Link to="/profile" onClick={() => setIsOpen(false)} className="dropdown-link">
                            My Profile
                        </Link>
                        <Link to="/bookings" onClick={() => setIsOpen(false)} className="dropdown-link">
                            My Bookings
                        </Link>
                        <Link to="/posts" onClick={() => setIsOpen(false)} className="dropdown-link">
                            My Posts
                        </Link>
                    </div>

                    <div className="dropdown-logout-container">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                logout();
                            }}
                            className="dropdown-btn-logout"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}