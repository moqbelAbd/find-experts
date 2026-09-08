import React from 'react';
import { MessageCircle, Users, Briefcase, Building, MapPin, Banknote, Clock } from 'lucide-react';
import './post-card.css';
import {getTimeAgo} from '../../utils/getTimeHelper.js'

export default function PostCard({ post }) {
    const normalizedType = String(post.type || '').toUpperCase();
    const isJob = normalizedType === '3' || normalizedType === 'JOB';
    const isService = normalizedType === '2' || normalizedType === 'SERVICE';

    const getTypeConfig = () => {
        switch (normalizedType) {
            case '1':
            case 'QUESTION':
                return { badgeClass: 'badge-question', label: 'Question', actionText: 'Answer' };
            case '2':
            case 'SERVICE':
                return { badgeClass: 'badge-service', label: 'Service', actionText: 'I Can Help' };
            case '3':
            case 'JOB':
                return { badgeClass: 'badge-job', label: 'Job', actionText: 'I\'m Suitable' };
            default:
                return { badgeClass: 'badge-default', label: 'Post', actionText: 'View' };
        }
    };

    // Helper functions to map backend integers to readable strings
    const getEmploymentType = (type) => {
        switch(String(type)) {
            case '1': return 'Full-Time';
            case '2': return 'Part-Time';
            case '3': return 'Contract';
            case '4': return 'Freelance';
            case 'FullTime': return 'Full-Time'; // Fallback if backend sends strings
            default: return 'Full-Time'; // Default fallback
        }
    };

    const getWorkLocationType = (type) => {
        switch(String(type)) {
            case '1': return 'On-Site';
            case '2': return 'Hybrid';
            case '3': return 'Remote';
            case 'OnSite': return 'On-Site';
            default: return 'Remote'; // Default fallback
        }
    };

    const config = getTypeConfig();

    return (
        <div className="post-card">
            <div className="post-card-header">
                <div className="post-author">
                    <img src={post.authorAvatar || 'https://i.pravatar.cc/150'} alt={post.authorName} className="author-avatar" />
                    <span className="author-name">{post.authorName || 'Unknown User'}</span>
                    <span className="post-time">{getTimeAgo(post.createdAt)}</span>
                </div>
                <div className={`post-badge ${config.badgeClass}`}>
                    {config.label}
                </div>
            </div>

            <div className="post-card-body">
                <p className="post-title">{post.postTitle}</p>
                <p className="post-excerpt">{post.postContent}</p>

                {/* Distinct Job Information Box */}
                {isJob && (
                    <div className="job-details-box">
                        {post.company && (
                            <div className="job-detail-item">
                                <Building size={16} />
                                <span><strong>Company:</strong> {post.company}</span>
                            </div>
                        )}

                        {(post.employmentType || true) && (
                            <div className="job-detail-item">
                                <Clock size={16} />
                                <span><strong>Type:</strong> {getEmploymentType(post.employmentType)}</span>
                            </div>
                        )}

                        {(post.workLocationType || true) && (
                            <div className="job-detail-item">
                                <MapPin size={16} />
                                <span>
                                    <strong>Location:</strong> {getWorkLocationType(post.workLocationType)}
                                    {post.jobLocation && String(post.workLocationType) !== '3' && ` (${post.jobLocation})`}
                                </span>
                            </div>
                        )}

                        {post.expectedSalary && (
                            <div className="job-detail-item">
                                <Banknote size={16} />
                                <span><strong>Salary:</strong> {post.expectedSalary}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Service Budget remains clear */}
                {isService && post.budget && (
                    <p className="post-budget"><strong>Budget:</strong> ${post.budget}</p>
                )}

                {/* Standard Tags */}
                <div className="post-tags-row">
                    {post.tags && post.tags.map((tag, idx) => (
                        <span key={idx} className="tag">{tag}</span>
                    ))}
                </div>
            </div>

            <div className="post-card-footer">
                <div className="post-metrics">
                    <span className="metric">
                        <MessageCircle size={16} /> {post.commentsCount || 0} {(post.commentsCount === 1) ? 'answer' : 'comments'}
                    </span>

                    {isService && (
                        <span className="metric">
                            <Users size={16} /> {post.interestedCount || 0} interested
                        </span>
                    )}

                    {isJob && (
                        <span className="metric">
                            <Briefcase size={16} /> {post.applicantsCount || 0} applicants
                        </span>
                    )}
                </div>

                <button className="btn-action">
                    {config.actionText}
                </button>
            </div>
        </div>
    );
}