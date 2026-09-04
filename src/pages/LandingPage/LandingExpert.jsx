import React from 'react';
import { Link } from 'react-router-dom';
import './landingExpert.css';

export default function LandingExpert() {
    return (
        <section className="landing-expert-section">
            <div className="container">
                <h2 className="expert-title">Share your expertise. Build your reputation.</h2>
                <p className="expert-subtitle">
                    Becoming an expert is free. Set up your profile, define your availability, and start getting discovered.
                </p>

                <Link to="/become-expert" className="btn accent-btn expert-cta-btn">
                    Become an Expert
                </Link>

                <div className="expert-features-grid">
                    <div className="expert-feature">
                        <span className="feature-icon">💬</span>
                        <div className="feature-text">
                            <h4>Help people in your field</h4>
                            <p>Answer questions and contribute to a professional community that values knowledge.</p>
                        </div>
                    </div>

                    <div className="expert-feature">
                        <span className="feature-icon">📅</span>
                        <div className="feature-text">
                            <h4>Offer paid consultations</h4>
                            <p>Set your own price, duration, and availability. You control when and how you work.</p>
                        </div>
                    </div>

                    <div className="expert-feature">
                        <span className="feature-icon">⭐</span>
                        <div className="feature-text">
                            <h4>Build your reputation</h4>
                            <p>Earn reviews and client guarantees that translate into a verified expert badge.</p>
                        </div>
                    </div>

                    <div className="expert-feature">
                        <span className="feature-icon">🤝</span>
                        <div className="feature-text">
                            <h4>Find new clients</h4>
                            <p>Get discovered by people actively looking for your exact skills and experience.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}