import React, { useState, useEffect, useRef } from 'react';
import axiosClient from "../../api/axiosClient";
import toast from 'react-hot-toast';

export default function ChatWindow({ activePartner }) {
    const [messages, setMessages] = useState([]);
    const [inputContent, setInputContent] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axiosClient.get(`/Message/chat/${activePartner.partnerId}`);
                const data = res.data?.data || res.data;
                setMessages(data || []);
            } catch (err) {
                console.error(err);
                // If it's a brand new chat, it might return 404 or empty, handle gracefully
                setMessages([]);
            }
        };

        if (activePartner?.partnerId) {
            fetchHistory();
        }
    }, [activePartner]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputContent.trim()) return;

        try {
            const payload = {
                receiverId: activePartner.partnerId,
                messageContent: inputContent
            };
            const res = await axiosClient.post('/Message', payload);
            const sentMessage = res.data?.data || res.data;

            setMessages(prev => [...prev, sentMessage]);
            setInputContent('');
        } catch (err) {
            console.error(err);
            toast.error("Failed to send message.");
        }
    };

    if (!activePartner) return null;

    return (
        <div className="chat-window-container">
            {/* Header */}
            <div className="chat-window-header">
                <img
                    src={activePartner.partnerAvatar || `https://ui-avatars.com/api/?name=${activePartner.partnerName}&background=F1FAF6&color=12372A`}
                    alt={activePartner.partnerName}
                    className="chat-window-avatar"
                />
                <span className="chat-window-title">{activePartner.partnerName}</span>
            </div>

            {/* Messages Box */}
            <div className="chat-messages-list">
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px' }}>
                        No messages yet. Say hello!
                    </div>
                ) : (
                    messages.map((m) => {
                        const isSentByMe = m.senderId !== activePartner.partnerId;
                        return (
                            <div key={m.messageId || Math.random()} className={`message-bubble-wrapper ${isSentByMe ? 'sent' : 'received'}`}>
                                <div className={`message-bubble ${isSentByMe ? 'sent' : 'received'}`}>
                                    {m.messageContent}
                                </div>
                                <span className="message-time">
                                    {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                    type="text"
                    className="chat-input-field"
                    placeholder="Type your message..."
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                />
                <button type="submit" className="chat-send-btn">Send</button>
            </form>
        </div>
    );
}