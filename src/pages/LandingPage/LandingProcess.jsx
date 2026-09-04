import React from 'react';
import './landingProcess.css';

export default function LandingProcess() {
    return (
        <section className="container landing-section">
            <h2 className="section-title" style={{ marginBottom: '16px' }}>The Process</h2>
            <p className="landing-subtitle">
                Three ways to get what you need from people who know what you are talking about.
            </p>

            <div className="landing-steps-grid">
                <div className="landing-step">
                    <div className="step-circle">1</div>
                    <div className="step-content">
                        <h3>Find the right expert</h3>
                        <p>Browse professionals by field, rating, price, and availability. Every expert builds their own profile — no algorithmic black box.</p>
                    </div>
                </div>

                <div className="landing-step">
                    <div className="step-circle">2</div>
                    <div className="step-content">
                        <h3>Connect your way</h3>
                        <p>Ask a question, post a service request, list a job, or book a paid consultation directly with the expert you want.</p>
                    </div>
                </div>

                <div className="landing-step">
                    <div className="step-circle">3</div>
                    <div className="step-content">
                        <h3>Get real outcomes</h3>
                        <p>Get answers, hire help, or book a consultation session. Leave a review and a guarantee to help the community grow.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}