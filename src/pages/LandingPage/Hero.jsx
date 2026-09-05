import { Search } from 'lucide-react';
import {Link, NavLink} from 'react-router-dom';
import './hero.css';

export default function Hero() {
    return (
        <section className="hero-section">
            <div className="container">
                <h1 className="hero-title">
                    Find the right expert<br />
                    for what you need.
                </h1>

                <p className="hero-subtitle">
                    Ask a question, find a professional, request a service, or book a paid one to one consultation.
                </p>

                {/*<div className="hero-search-wrapper">*/}
                {/*    <div className="hero-search-input-group">*/}
                {/*        <Search className="hero-search-icon" size={20} />*/}
                {/*        <input*/}
                {/*            type="text"*/}
                {/*            placeholder="Search by skill, field, or name..."*/}
                {/*            className="hero-input"*/}
                {/*        />*/}
                {/*    </div>*/}
                {/*    <button className="btn hero-btn hero-search-btn">*/}
                {/*        Search*/}
                {/*    </button>*/}
                {/*</div>*/}

                <div className="hero-actions">
                    <NavLink to="/find-experts"  className="btn primary-btn">
                        Find Experts
                    </NavLink>
                    <button className="btn hero-outline-btn">
                        Post What You Need
                    </button>
                </div>
            </div>
        </section>
    );
}