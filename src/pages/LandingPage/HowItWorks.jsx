import "./howItWorks.css"
import { Link } from 'react-router-dom';
import {useState} from "react";
import { ChevronDown } from 'lucide-react';

export default function HowItWorks() {

    const steps = [
        {
            icon: "👤",
            number: "01",
            title: "Create your account",
            description: "Sign up in under a minute. No approval process, no waiting — your account is active immediately."
        },
        {
            icon: "🔍",
            number: "02",
            title: "Find what you need",
            description: "Browse experts by field, search for a specific skill, or post what you need and let experts come to you."
        },
        {
            icon: "🤝",
            number: "03",
            title: "Connect and get help",
            description: "Ask a question, request a service, post a job, or book a paid one-on-one consultation — your choice."
        },
        {
            icon: "⭐",
            number: "04",
            title: "Review and build trust",
            description: "After a completed consultation, leave a review and give a Guarantee to experts who delivered real value."
        }
    ];

    const expertSteps = [
        {
            icon: "🚀",
            number: "01",
            title: "Activate your expert profile",
            description: "Click 'Go Expert' from your profile menu. Fill in your title, field, bio, skills, and experience."
        },
        {
            icon: "📅",
            number: "02",
            title: "Set up consultations (optional)",
            description: "Enable paid consultations, set your price and duration, and define your weekly availability."
        },
        {
            icon: "💬",
            number: "03",
            title: "Help the community",
            description: "Answer questions, respond to service requests, or indicate suitability for job posts."
        },
        {
            icon: "🏅",
            number: "04",
            title: "Earn reviews and guarantees",
            description: "Great work gets recognized. Reviews and Client Guarantees build your badge and make you more discoverable."
        }
    ];

    const faqs = [
        {
            q: "Is it free to use?",
            a: "Creating an account, posting, and answering questions is completely free. Consultations are paid — experts set their own price."
        },
        {
            q: "What is a Client Guarantee?",
            a: "A Guarantee is when a client vouches for an expert — not just a rating, but a personal endorsement. Earning 3, 5, 10, or 15 guarantees unlocks an expert badge."
        },
        {
            q: "How are consultations conducted?",
            a: "Via Google Meet or a similar video link. We do not build video calling — you use your preferred tool. The meeting link is shared once the expert accepts."
        },
        {
            q: "Can any user become an expert?",
            a: "Yes. Any user can click 'Go Expert' and set up an expert profile. There is no approval gate for the MVP — just fill in your professional information honestly."
        },
        {
            q: "What if I need to cancel a consultation?",
            a: "Either party can cancel before the session. Cancellations move the booking to Cancelled status. We recommend communicating directly via messaging."
        }
    ];

// State for the entire FAQ section
    const [isSectionOpen, setIsSectionOpen] = useState(false);

    // State for individual questions inside the section
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleFaq = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="how-it-works-page">

            <section className="hiw-header-section">
                <div className="container hiw-header-container">
                    <h1 className="hiw-main-title">How Rent an Expert works</h1>
                    <p className="hiw-subtitle">
                        A professional marketplace built around real knowledge, real trust, and real outcomes.
                    </p>
                </div>
            </section>

            <section className="container hiw-section">
                <span className="hiw-pre-title">FOR EVERYONE</span>
                <h2 className="section-title">Finding help has never been simpler</h2>

                <div className="hiw-steps-grid">
                    {steps.map((step, index) => (
                        <div key={index} className="hiw-step-card">
                            <div className="hiw-step-icon">{step.icon}</div>
                            <div className="hiw-step-number">{step.number}</div>
                            <h3 className="hiw-step-title">{step.title}</h3>
                            <p className="hiw-step-desc">{step.description}</p>
                        </div>
                    ))}
                </div>

                <div className="hiw-action-wrapper">
                    <Link to="/experts" className="btn primary-btn">
                        Find an Expert
                    </Link>
                </div>
            </section>

            <section className="container hiw-section">
                <span className="hiw-pre-title">POST TYPES</span>
                <h2 className="section-title">Three ways to get what you need</h2>

                <div className="hiw-cards-grid">
                    {/* Question Card */}
                    <div className="hiw-type-card card-purple">
                        <span className="hiw-badge badge-purple">Question</span>
                        <p className="hiw-type-desc">
                            Ask anything in your field. Experts answer publicly so everyone benefits.
                        </p>
                        <div className="hiw-example-box">
                            <span className="hiw-example-label">Example post</span>
                            <p className="hiw-example-text">
                                "How do I optimize a PostgreSQL query that joins 5 tables?"
                            </p>
                        </div>
                        <p className="hiw-type-footer">
                            Experts respond by clicking  <strong > Answer </strong>
                        </p>
                    </div>

                    {/* Service Request Card */}
                    <div className="hiw-type-card card-blue">
                        <span className="hiw-badge badge-blue">Service Request</span>
                        <p className="hiw-type-desc">
                            Need something done? Post a service request. Interested experts send offers and you choose.
                        </p>
                        <div className="hiw-example-box">
                            <span className="hiw-example-label">Example post</span>
                            <p className="hiw-example-text">
                                "Need a brand identity kit for my SaaS startup."
                            </p>
                        </div>
                        <p className="hiw-type-footer">
                            Experts respond by clicking  <strong > I Can Help </strong>
                        </p>
                    </div>

                    {/* Job Card */}
                    <div className="hiw-type-card card-yellow">
                        <span className="hiw-badge badge-yellow">Job</span>
                        <p className="hiw-type-desc">
                            Hiring? Post a job and qualified experts indicate their suitability.
                        </p>
                        <div className="hiw-example-box">
                            <span className="hiw-example-label">Example post</span>
                            <p className="hiw-example-text">
                                "Senior React Developer — Full-Time, Remote"
                            </p>
                        </div>
                        <p className="hiw-type-footer">
                            Experts respond by clicking  <strong > I'm Suitable </strong>
                        </p>
                    </div>
                </div>

                <div className="hiw-action-wrapper">
                    <Link to="/posts/create" className="btn primary-btn">
                        Create a Post
                    </Link>
                </div>
            </section>

            <section className="hiw-experts-section">
                <div className="container hiw-section">
                    <span className="hiw-pre-title text-light-green">FOR EXPERTS</span>
                    <h2 className="section-title text-white">Turn your expertise into impact</h2>
                    <p className="hiw-experts-subtitle">Any user can activate an expert profile. No approval required.</p>

                    <div className="hiw-steps-grid">
                        {expertSteps.map((step, index) => (
                            <div key={index} className="hiw-step-card">
                                <div className="hiw-step-icon">{step.icon}</div>
                                <div className="hiw-step-number text-light-green">{step.number}</div>
                                <h3 className="hiw-step-title text-white">{step.title}</h3>
                                <p className="hiw-step-desc text-light-gray">{step.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="hiw-action-wrapper">
                        <Link to="/become-expert" className="btn expert-action-btn">
                            Become an Expert
                        </Link>
                    </div>
                </div>
            </section>

            <section className="container hiw-section">
                <span className="hiw-pre-title">TRUST SYSTEM</span>
                <h2 className="section-title" style={{ marginBottom: "16px" }}>Client Guarantees, not gaming badges</h2>
                <p className="hiw-trust-desc">
                    When a client gives an expert a Guarantee, they are personally vouching for them. Guarantees unlock expert badges — but they cannot be bought, gamed, or earned through ratings alone.
                </p>

                <div className="hiw-badges-grid">
                    <div className="hiw-badge-card theme-green">
                        <div className="badge-header">
                            <span className="badge-dot"></span> Verified Expert
                        </div>
                        <div className="badge-number">3</div>
                        <div className="badge-label">client guarantees</div>
                    </div>


                    <div className="hiw-badge-card theme-bronze">
                        <div className="badge-header">
                            <span className="badge-dot"></span> Bronze Expert
                        </div>
                        <div className="badge-number">5</div>
                        <div className="badge-label">client guarantees</div>
                    </div>

                    <div className="hiw-badge-card theme-silver">
                        <div className="badge-header">
                            <span className="badge-dot"></span> Silver Expert
                        </div>
                        <div className="badge-number">10</div>
                        <div className="badge-label">client guarantees</div>
                    </div>

                    <div className="hiw-badge-card theme-gold">
                        <div className="badge-header">
                            <span className="badge-dot"></span> Gold Expert
                        </div>
                        <div className="badge-number">15</div>
                        <div className="badge-label">client guarantees</div>
                    </div>
                </div>
            </section>

            <section className="container hiw-section hiw-faq-section">
                {/* Master Toggle Button */}
                <button
                    className="faq-section-toggle"
                    onClick={() => setIsSectionOpen(!isSectionOpen)}
                >
                    <h2 className="section-title" style={{ margin: 0 }}>Frequently asked questions</h2>
                    <ChevronDown
                        className={`faq-section-icon ${isSectionOpen ? 'rotate' : ''}`}
                        size={28}
                    />
                </button>

                {/* Master Accordion Wrapper */}
                <div className={`faq-section-wrapper ${isSectionOpen ? 'open' : ''}`}>
                    <div className="faq-section-inner">
                        <div className="faq-list">
                            {faqs.map((faq, index) => {
                                const isOpen = activeIndex === index;

                                return (
                                    <div key={index} className={`faq-item ${isOpen ? 'open' : ''}`}>
                                        <button
                                            className="faq-question-btn"
                                            onClick={() => toggleFaq(index)}
                                        >
                                            <h4 className="faq-question">{faq.q}</h4>
                                            <ChevronDown
                                                className={`faq-icon ${isOpen ? 'rotate' : ''}`}
                                                size={20}
                                            />
                                        </button>

                                        <div className="faq-answer-wrapper">
                                            <div className="faq-answer-inner">
                                                <p className="faq-answer">{faq.a}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}