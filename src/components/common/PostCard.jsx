import React, {useState} from 'react';
import {X,MessageCircle, Users, Briefcase, Building, MapPin, Banknote, Clock, Edit, Trash2, Undo2, Lock} from 'lucide-react';
import { useNavigate , Link} from 'react-router-dom';
import './post-card.css';
import { getUserIdFromToken } from '../../utils/authUtils.js';
import {getTimeAgo} from '../../utils/getTimeHelper.js'
import axiosClient from "../../api/axiosClient.js";
import toast from "react-hot-toast";

export default function PostCard({ post }) {

    const navigate = useNavigate();

    const currentUserId = getUserIdFromToken();
    const isAuthor = currentUserId === post.authorId;

    const normalizedType = String(post.type || '').toUpperCase();
    const isJob = normalizedType === '3' || normalizedType === 'JOB';
    const isService = normalizedType === '2' || normalizedType === 'SERVICE';

    const isExpired = post.postDeadLine ? new Date(post.postDeadLine) <= new Date() : false;
    const isClosed = post.postStatus === 'Closed' || post.postStatus !== 1 || isExpired;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [interests, setInterests] = useState([]);
    const [isLoadingInterests, setIsLoadingInterests] = useState(false);

    const handleExpressInterest = async () => {
        if (!currentUserId) {
            toast.error("Please sign in to apply.");
            return navigate('/login');
        }

        try {
            await axiosClient.post(`/postinterest/${post.postId}`);
            toast.success("Successfully applied!");
            // Optionally, visually update the applicants count here
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to apply.");
        }
    };

    const handleViewInterests = async () => {
        setIsModalOpen(true);
        setIsLoadingInterests(true);
        try {
            const res = await axiosClient.get(`/postinterest/${post.postId}`);
            setInterests(res.data?.data || res.data || []);
        } catch (error) {
            toast.error("Failed to load applicants.");
            setIsModalOpen(false);
        } finally {
            setIsLoadingInterests(false);
        }
    };

    // --- Dynamic Configuration based on Authorship ---
    const getTypeConfig = () => {
        if (isAuthor) {
            switch (normalizedType) {
                case '1':
                case 'QUESTION':
                    return { badgeClass: 'badge-question', label: 'Question', actionText: 'View Answers', actionClick: () => navigate(`/post/${post.postId}`) };
                case '2':
                case 'SERVICE':
                    return { badgeClass: 'badge-service', label: 'Service', actionText: 'View Interests', actionClick: handleViewInterests };
                case '3':
                case 'JOB':
                    return { badgeClass: 'badge-job', label: 'Job', actionText: 'View Applicants', actionClick: handleViewInterests };
                default:
                    return { badgeClass: 'badge-default', label: 'Post', actionText: 'View', actionClick: () => navigate(`/post/${post.postId}`) };
            }
        } else {
            switch (normalizedType) {
                case '1':
                case 'QUESTION':
                    return { badgeClass: 'badge-question', label: 'Question', actionText: 'Answer', actionClick: () => navigate(`/post/${post.postId}`) };
                case '2':
                case 'SERVICE':
                    return { badgeClass: 'badge-service', label: 'Service', actionText: isClosed? 'Closed' : 'I Can Help', actionClick: handleExpressInterest };
                case '3':
                case 'JOB':
                    return { badgeClass: 'badge-job', label: 'Job', actionText: isClosed? 'Closed' : "I'm Suitable", actionClick: handleExpressInterest };
                default:
                    return { badgeClass: 'badge-default', label: 'Post', actionText: 'View', actionClick: () => navigate(`/post/${post.postId}`) };
            }
        }
    };

    // Helper functions to map backend integers to readable strings
    const getEmploymentType = (type) => {
        switch(String(type)) {
            case '1': return 'Full-Time';
            case '2': return 'Part-Time';
            case '3': return 'Contract';
            case '4': return 'Freelance';
            default: return 'Full-Time'; // Default fallback
        }
    };

    const getWorkLocationType = (type) => {
        switch(String(type)) {
            case '1': return 'On-Site';
            case '2': return 'Hybrid';
            case '3': return 'Remote';
            default: return 'Remote'; // Default fallback
        }
    };

    const config = getTypeConfig();

    const handleEditClick = () => {
        navigate(`/post/edit/${post.postId}`, {
            state: {
                isEdit: true,
                initialData: post,
                postId: post.postId
            }
        });
    };

    const handleStatusChange = async (newStatusEnum) => {
        const actionText = newStatusEnum === 2 ? 'Completed' : 'Cancelled';

        if (newStatusEnum === 3 && !window.confirm("Are you sure you want to delete this post?")) {
            return;
        }

        try {
            await axiosClient.patch(`/post/${post.postId}/status?Status=${newStatusEnum}`, null);
            toast.success(`Post ${actionText}d successfully`);

            // Reload the page to refresh the feed and remove the deleted/closed post
            window.location.reload();
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${actionText} post.`);
        }
    };

    const backendBaseUrl = "https://localhost:7252";
    return (
        <div className="post-card">
            <div className="post-card-header">

                <div className="header-left" style={{display: 'flex', alignItems: 'center',gap: '12px'}}>
                <Link to={`/profile/${post.authorId}`} className="post-author">
                    <img src={post.authorAvatar || `https://ui-avatars.com/api/?name=${post.authorName}`} alt={post.authorName} className="author-avatar" />
                    <span className="author-name">{post.authorName || 'Unknown User'}</span>
                </Link>
                <span className="post-time">{getTimeAgo(post.createdAt)}</span>
                </div>

                <div style={{display:"flex", gap:"8px"}} >
                    {isAuthor &&  (
                        <>
                            {/* Only show Close if it's not already closed */}
                            {post.postStatus !== 3 && post.postStatus !== 2 && (
                                <button className="btn-edit-post" onClick={() => handleStatusChange(2)} title="Close Post">
                                    <Lock size={16} />
                                </button>
                            )}

                            {post.postStatus !== 3 && (
                            <button className="btn-edit-post" onClick={handleEditClick} title="Edit Post">
                                <Edit size={16} />
                            </button>
                            )}
                            {post.postStatus !== 3 && (

                                <button className="btn-edit-post" onClick={() => handleStatusChange(3)} title="Delete Post" style={{ color: 'var(--danger)' }}>
                                    <Trash2 size={16} />
                                </button>
                            )}
                            {post.postStatus === 3 && (

                                <button className="btn-edit-post" onClick={() => handleStatusChange(1)} title="Undo delete Post" style={{ color: 'var(--danger)' }}>
                                    <Undo2 size={16} />
                                </button>
                            )}

                        </>
                    )}
                <div className={`post-badge ${config.badgeClass}`}>
                    {config.label}
                </div>
                </div>
            </div>

            <div className="post-card-body">
                <Link to={`/post/${post.postId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <p className="post-title" style={{ cursor: 'pointer' }}>{post.postTitle}</p>
                </Link>

                <p className="post-excerpt">
                    {post.postContent && post.postContent.length > 500
                        ? `${post.postContent.substring(0, 500)}...`
                        : post.postContent
                    }

                    {post.postContent && post.postContent.length > 500 && (
                        <span
                            onClick={() => navigate(`/post/${post.postId}`)}
                            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '500', marginLeft: '4px' }}
                        >
                            Read more
                        </span>
                    )}
                </p>
                {post.attachedPhoto && (
                    <img
                    src={post.attachedPhotoUrl ? `${backendBaseUrl}${post.attachedPhotoUrl}` : '/fallback-image.png'}
                alt="Post Attachment"
            />
                )}
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
                        <Link to={`/post/${post.postId}`} >
                         <span className="metric" style={{color: 'green'}}>
                        <MessageCircle size={16} /> {post.commentsCount || 0} {(post.commentsCount === 1) ? 'answer' : 'comments'}
                         </span>
                        </Link>

                    {isService && (
                        <button onClick={handleViewInterests}>
                        <span className="metric">
                            <Users size={16} /> {post.interestedCount || 0} interested
                        </span>
                        </button>
                    )}

                    {isJob && (
                        <button onClick={handleViewInterests}>
                        <span className="metric">
                            <Briefcase size={16} /> {post.applicantsCount || 0} applicants
                        </span>
                        </button>
                    )}
                </div>

                <button className="btn-action" onClick={config.actionClick}>
                    {config.actionText}
                </button>
            </div>
            {isModalOpen && (
                <div className="interests-modal-overlay">
                    <div className="interests-modal-content">
                        <div className="interests-modal-header">
                            <h3>{isJob ? 'Job Applicants' : 'Interested Experts'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="close-modal-btn">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="interests-list">
                            {isLoadingInterests ? (
                                <p className="interests-empty-message">Loading experts...</p>
                            ) : interests.length === 0 ? (
                                <p className="interests-empty-message muted">No one has applied yet.</p>
                            ) : (
                                interests.map(interest => (
                                    <div key={interest.expertId} className="interest-item">
                                        <Link to={`/expert/${interest.expertId}`}>
                                            <img src={interest.avatar || `https://ui-avatars.com/api/?name=${interest.fullName}`} alt={interest.fullName} className="interest-avatar" />
                                        </Link>
                                        <div className="interest-info">
                                            <Link to={`/expert/${interest.expertId}`} className="interest-name">
                                                {interest.fullName}
                                            </Link>
                                            <span className="interest-time">Applied {getTimeAgo(interest.appliedAt)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}