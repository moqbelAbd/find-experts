import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import './layout.css';
import logo from "../../assets/Logo/white platform logo.png";
import React from "react";

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
                                <img className="footer-logo"
                                    src={logo}
                                    alt="Expert video consultation and workspace"
                                />
                        </div>
                        <p className="footer-description">
                            The professional marketplace for knowledge and skills.
                        </p>
                    <div className="footer-bottom">
                        © 2026 FindExperts. All rights reserved.
                    </div>
                    </div>

                </div>
            </footer>
        </div>
    );
}