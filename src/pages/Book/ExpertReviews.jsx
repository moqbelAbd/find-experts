import React from 'react';
import { Star } from 'lucide-react';
import {getTimeAgo} from "../../utils/getTimeHelper.js";
import "./expert-reviews.css"

export default function ExpertReviews({ reviews }) {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="booking-card">
                <h3>Client Reviews</h3>
                <p className="muted">No reviews yet. Be the first to book a session</p>
            </div>
        );
    }

    return (
        <div className="booking-card">
            <h3>Client Reviews ({reviews.length})</h3>
            <div className="reviews-list">
                {reviews.map((review) => (
                    <div key={review.reviewId} className="review-item">
                        <div className="review-header">
                            <img
                                src={review.reviewerAvatar || `https://ui-avatars.com/api/?name=${review.reviewerName}`}
                                alt={review.reviewerName}
                                className="reviewer-avatar"
                            />
                            <div className="reviewer-info">
                                <span className="reviewer-name">{review.reviewerName}</span>
                                <div className="review-rating-row">
                                    <div className="stars">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                fill={i < review.rating ? "#fbbf24" : "none"}
                                                stroke={i < review.rating ? "#fbbf24" : "#d1d5db"}
                                            />
                                        ))}
                                    </div>
                                    <span className="review-time">{getTimeAgo(review.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                        {review.comment && <p className="review-comment">{review.comment}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}