import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import './layout.css';

export default function Layout() {
    return (
        <div className="site-layout">
            <Navbar />
            <main className="site-main">
                <Outlet />
            </main>

            <footer className="site-footer">
                <div className="footer-container">
                    <div className="footer-content">
                        <div className="footer-brand-wrapper">
                            <div className="footer-logo-box">
                                <span className="footer-logo-text">RE</span>
                            </div>
                            <span className="footer-brand-title">Rent an Expert</span>
                        </div>
                        <p className="footer-description">
                            The professional marketplace for knowledge and skills.
                        </p>
                    <div className="footer-bottom">
                        © 2026 Rent an Expert. All rights reserved.
                    </div>
                    </div>

                </div>
            </footer>
        </div>
    );
}