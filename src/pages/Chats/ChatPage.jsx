import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axiosClient from "../../api/axiosClient";
import ChatWindow from './ChatWindow';
import toast from 'react-hot-toast';
import './chat-page.css';

export default function ChatPage() {
    const [conversations, setConversations] = useState([]);
    const [activePartner, setActivePartner] = useState(null);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const routerTargetUser = location.state?.targetUser;

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await axiosClient.get('/Message/conversations');
                let data = res.data?.data || res.data;

                if (routerTargetUser) {
                    const existingIndex = data.findIndex(c => c.partnerId === routerTargetUser.partnerId);

                    if (existingIndex !== -1) {
                        setActivePartner(data[existingIndex]);
                    } else {
                        const newConversation = {
                            partnerId: routerTargetUser.partnerId,
                            partnerName: routerTargetUser.partnerName,
                            partnerAvatar: routerTargetUser.partnerAvatar,
                            lastMessage: 'Start a conversation...',
                            lastMessageDate: new Date().toISOString(),
                            unreadCount: 0
                        };
                        data = [newConversation, ...data];
                        setActivePartner(newConversation);
                    }
                } else if (data.length > 0 && !activePartner) {
                    // Optional: auto-select the first conversation if no route state exists
                    // setActivePartner(data[0]);
                }

                setConversations(data);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load conversations.");
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [routerTargetUser]);

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading chats...</div>;
    }

    return (
        <div className="chat-page-container">
            {/* Sidebar list */}
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">Messages</div>
                <div className="conversations-list">
                    {conversations.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No conversations found</div>
                    ) : (
                        conversations.map((c) => (
                            <div
                                key={c.partnerId}
                                className={`conversation-item ${activePartner?.partnerId === c.partnerId ? 'active' : ''}`}
                                onClick={() => setActivePartner(c)}
                            >
                                <img
                                    src={c.partnerAvatar || `https://ui-avatars.com/api/?name=${c.partnerName}&background=F1FAF6&color=12372A`}
                                    alt={c.partnerName}
                                    className="conversation-avatar"
                                />
                                <div className="conversation-info">
                                    <div className="conversation-top">
                                        <span className="conversation-name">{c.partnerName}</span>
                                        <span className="conversation-time">
                                            {c.lastMessageDate ? new Date(c.lastMessageDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                                        </span>
                                    </div>
                                    <div className="conversation-bottom">
                                        <span className="conversation-last-msg">{c.lastMessage}</span>
                                        {c.unreadCount > 0 && (
                                            <span className="unread-badge">{c.unreadCount}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Window or Empty State */}
            {activePartner ? (
                <ChatWindow activePartner={activePartner} />
            ) : (
                <div className="chat-empty-state">
                    <h3>Select a conversation to start messaging</h3>
                </div>
            )}
        </div>
    );
}