import React from 'react';
import "./booking-summary.css"

export default function BookingSummary({
                                           expertName,
                                           date,
                                           time,
                                           duration,
                                           price,
                                           onSubmit
                                       }) {
    const isReady = date && time && duration;

    return (
        <div className="booking-summary-card">
            <h3>Booking summary</h3>

            <div className="summary-details">
                <div className="summary-row">
                    <span className="label">Expert</span>
                    <span className="value font-medium">{expertName}</span>
                </div>

                <div className="summary-row">
                    <span className="label">Date</span>
                    <span className="value">
                        {date ? date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : '—'}
                    </span>
                </div>

                <div className="summary-row">
                    <span className="label">Time</span>
                    <span className="value">{time ? time : '—'}</span>
                </div>

                <div className="summary-row">
                    <span className="label">Duration</span>
                    <span className="value">{duration ? `${duration} minutes` : '—'}</span>
                </div>

                <div className="summary-row price-row">
                    <span className="label">Price</span>
                    <span className="value price">${price || '—'}</span>
                </div>
            </div>

            <button
                className={`btn-request ${isReady ? 'active' : 'disabled'}`}
                onClick={onSubmit}
                disabled={!isReady}
            >
                Request Consultation
            </button>

            <p className="disclaimer">
                Your request will be confirmed once the expert accepts.
            </p>
        </div>
    );
}