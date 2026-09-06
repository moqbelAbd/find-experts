import React from 'react';
import { Link } from 'react-router-dom';
import './hero.css';
import heroImg from '../../assets/Hero background.jpg';

export default function Hero() {
    return (
        <section className="hero-section">
            <div className="hero-container">

                {/* Left Side: Structured Text */}
                <div className="hero-text-content">

                    <h1 className="hero-title">
                        Find the right expert<br />
                        <span className="text-highlight">Consult Top Experts</span><br />
                        for what you need
                    </h1>

                    <p className="hero-subtitle">
                        Ask a question, find a professional, request a service, or book a paid one to one consultation.
                    </p>

                    <div className="hero-actions">
                        <Link to="/find-experts" className="btn primary-btn hero-btn">
                            Find an Expert
                        </Link>
                        <Link to="/become-expert" className="btn outline-btn hero-btn hero-outline-btn">
                            Become an Expert
                        </Link>
                    </div>
                </div>

                {/* Right Side: Image */}
                <div className="hero-image-container">
                    <img
                        src={heroImg}
                        alt="Expert video consultation and workspace"
                        className="hero-real-image"
                    />
                </div>

            </div>
        </section>
    );
}