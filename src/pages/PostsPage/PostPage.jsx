import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from "../../api/axiosClient.js";
import { toast } from 'react-hot-toast';
import { getUserIdFromToken } from '../../utils/authUtils.js';
import { getTimeAgo } from '../../utils/getTimeHelper.js';
import PostCard from "../../components/common/PostCard.jsx";
import { Edit2, Trash2, X, Check, MessageSquareQuote } from 'lucide-react';
import './post-page.css';

export default function PostPage() {
    const { id } = useParams();
    const currentUserId = getUserIdFromToken();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sortOrder, setSortOrder] = useState('newest');

    // State for inline editing
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState('');

    // State for inline replying
    const [replyingToId, setReplyingToId] = useState(null);
    const [replyContent, setReplyContent] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [postRes, commentsRes] = await Promise.all([
                axiosClient.get(`/post/${id}`),
                axiosClient.get(`/comment/${id}?sort=${sortOrder}`)
            ]);

            setPost(postRes.data?.data || postRes.data);
            setComments(commentsRes.data?.data || commentsRes.data || []);
        } catch (error) {
            console.error("Failed to load post data", error);
            toast.error("Failed to load post.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id, sortOrder]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            await axiosClient.post('/comment', {
                postId: id,
                content: newComment
            });

            toast.success("Comment added!");
            setNewComment('');
            fetchData(); // Refresh to get the new list
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add comment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReplySubmit = async (parentCommentId) => {
        if (!replyContent.trim()) return;

        try {
            await axiosClient.post('/comment', {
                postId: id,
                content: replyContent,
                parentCommentId: parentCommentId
            });
            toast.success("Reply added!");
            setReplyingToId(null);
            setReplyContent('');
            fetchData(); // Refresh to get the new list
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add reply");
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            await axiosClient.delete(`/comment/${commentId}`);
            toast.success("Comment deleted");
            setComments(prev => prev.filter(c => c.commentId !== commentId));
            setPost(prev => ({ ...prev, commentsCount: prev.commentsCount - 1 }));
        } catch (error) {
            toast.error("Failed to delete comment");
        }
    };

    const startEditing = (comment) => {
        setEditingCommentId(comment.commentId);
        setEditContent(comment.content);
    };

    const handleSaveEdit = async (commentId) => {
        if (!editContent.trim()) return;

        try {
            await axiosClient.put(`/comment/${commentId}`, { content: editContent });
            toast.success("Comment updated");

            setComments(prev => prev.map(c =>
                c.commentId === commentId ? { ...c, content: editContent } : c
            ));
            setEditingCommentId(null);
        } catch (error) {
            toast.error("Failed to update comment");
        }
    };

    if (isLoading && !post) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading post...</div>;
    if (!post) return <div style={{ textAlign: 'center', padding: '50px' }}>Post not found.</div>;

    // Filter comments into parents and children
    const topLevelComments = comments.filter(c => !c.parentCommentId);
    const getRepliesForComment = (parentId) => comments.filter(c => c.parentCommentId === parentId);

    // Helper function to render a comment layout
    const renderComment = (comment, isReply = false) => (
        <div key={comment.commentId} className="comment-item" style={{ marginLeft: isReply ? '40px' : '0', marginTop: isReply ? '12px' : '0' }}>
            <Link to={`/profile/${comment.authorId}`}>
                <img
                    src={comment.authorAvatar || 'https://i.pravatar.cc/150'}
                    alt={comment.authorName}
                    className="comment-avatar"
                    style={{ width: isReply ? '30px' : '40px', height: isReply ? '30px' : '40px' }}
                />
            </Link>
            <div className="comment-content" style={{ flex: 1 }}>
                <div className="comment-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Link to={`/profile/${comment.authorId}`} className="comment-author">
                            {comment.authorName}
                        </Link>
                        <span className="comment-time">{getTimeAgo(comment.createdAt)}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        {currentUserId && !isReply && (
                            <button onClick={() => { setReplyingToId(comment.commentId); setReplyContent(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }} title="Reply">
                                <MessageSquareQuote size={14} />
                            </button>
                        )}

                        {currentUserId === comment.authorId && (
                            <>
                                <button onClick={() => startEditing(comment)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Edit">
                                    <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDeleteComment(comment.commentId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }} title="Delete">
                                    <Trash2 size={14} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {editingCommentId === comment.commentId ? (
                    <div className="comment-edit-box" style={{ marginTop: '8px' }}>
                        <textarea
                            className="form-control"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={2}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setEditingCommentId(null)} className="btn secondary-btn" style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <X size={14} /> Cancel
                            </button>
                            <button onClick={() => handleSaveEdit(comment.commentId)} className="btn primary-btn" style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={14} /> Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="comment-text">{comment.content}</p>
                )}

                {replyingToId === comment.commentId && (
                    <div className="comment-reply-box" style={{ marginTop: '12px' }}>
                        <textarea className="form-control" placeholder="Write a reply..." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} rows={2} autoFocus />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setReplyingToId(null)} className="btn secondary-btn" style={{ padding: '4px 8px' }}>Cancel</button>
                            <button onClick={() => handleReplySubmit(comment.commentId)} className="btn primary-btn" style={{ padding: '4px 8px' }}>Post Reply</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="container post-page-wrapper">
            <PostCard post={post} />

            <div className="comments-section">
                <div className="comments-header">
                    <h3>Comments ({comments.length})</h3>
                    <select
                        className="sort-select"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>

                {currentUserId ? (
                    <form onSubmit={handleCommentSubmit} className="comment-form">
                        <textarea
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                            className="form-control"
                            required
                        />
                        <div className="comment-form-actions">
                            <button type="submit" className="btn primary-btn" disabled={isSubmitting || !newComment.trim()}>
                                {isSubmitting ? 'Posting...' : 'Post Comment'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="login-prompt">
                        <p>Please <Link to="/login">sign in</Link> to leave a comment.</p>
                    </div>
                )}

                <div className="comments-list">
                    {topLevelComments.length === 0 ? (
                        <p className="no-comments">No comments yet. Be the first to start the conversation!</p>
                    ) : (
                        topLevelComments.map(comment => (
                            <div key={comment.commentId} style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
                                {/* Render the main parent comment */}
                                {renderComment(comment, false)}

                                {/* Render all replies belonging to this parent */}
                                {getRepliesForComment(comment.commentId).map(reply =>
                                    renderComment(reply, true)
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}