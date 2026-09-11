import React, { useState, useEffect, useRef } from 'react';
import { Link ,useParams} from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosClient  from '/src/api/axiosClient.js'
import "./user-profile.css"
import {getUserIdFromToken} from "../../utils/authUtils.js";
import PostCard from "../../components/common/PostCard.jsx";

export default function UserProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [locationInput, setLocationInput] = useState('');
    const fileInputRef = useRef(null);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const {userId} = useParams();
    const currentUserId = getUserIdFromToken();
    const isOwner = userId === currentUserId;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // If there's an ID in the URL, append it. Otherwise, call the base endpoint.
                const endpoint = userId ? `/User/profile/${userId}` : `/User/profile`;
                const response = await axiosClient.get(endpoint);
                setProfile(response.data.data);

                // ... set profile state
            } catch (error) {
                // If the backend returns 401 (guest with no ID), redirect to login
                if (error.response?.status === 401) {
                    window.location.href = '/login';
                }
                }finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    const handleLocationSave = async () => {
        const toastId = toast.loading('Saving location...');

        try {
            await axiosClient.put('/User/location', { userLocation: locationInput });

            setProfile({ ...profile, userLocation: locationInput });
            setIsEditingLocation(false);

            toast.success('Location updated successfully!', { id: toastId });
        } catch (error) {

            console.error("Error saving location:", error);

            const backendData = error.response?.data;

            const errorMessage =
                backendData?.message ||
                backendData?.errors?.[0] ||
                'Failed to update location.';

            toast.error(errorMessage, { id: toastId });
        }
    };
    const handleAvatarUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            // We only need to override the Content-Type for this specific multipart request
            const response = await axiosClient.post('/User/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setProfile({ ...profile, avatar: response.data.data });
        } catch (error) {
            console.error("Error uploading avatar:", error);
        }
    };

// Fetch user posts
    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const targetUserId = userId || currentUserId;

                const response = await axiosClient.get('/post', {
                    params: { authorId: targetUserId }
                });

                const fetchedData = response.data?.data || response.data;

                if (fetchedData && fetchedData.length > 0) {
                    setPosts(fetchedData);
                }
            } catch (error) {
                console.warn("error fetching posts", error);
            } finally {
                setLoading(false);
            }
        };

            fetchPosts();
    }, [userId, currentUserId]);


    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!profile) return <div className="p-10 text-center text-red-500">Failed to load profile.</div>;

    const initials = profile.fullName ? profile.fullName.substring(0, 2).toUpperCase() : 'U';

    return (
        <div className="container">
            <div className="profile-page-wrapper">
                <div className="profile-header">
                    {/* Using your global section-title */}
                    <h1 className="section-title" style={{ marginBottom: 0 }}>
                        {isOwner ? 'My Profile' :  'User Profile' }
                </h1>
                    {profile.expertProfileId ? (
                        <Link to={`/expert/${profile.expertProfileId}`} className="btn primary-btn">
                            View Expert Profile
                        </Link>
                    ) : isOwner && (
                        <Link to="/become-expert" className="btn outline-btn">
                            Go Expert
                        </Link>
                    )}


                </div>

                <div className="profile-content">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar-circle">
                            <img
                                src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || 'User')}`}
                                alt="Profile"
                            />
                        </div>
                        { isOwner && (
                        <><button onClick={() => fileInputRef.current.click()} className="btn-upload-photo">
                            Upload Photo
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarUpload}
                            className="hidden-file-input"
                            accept="image/*"
                        />
                        </>
                    )}
                    </div>

                    <div className="profile-info-section">
                        <div className="info-group">
                            <label>Full Name</label>
                            <p>{profile.fullName}</p>
                        </div>

                        <div className="info-group">
                            <label>Email Address</label>
                            <p>{profile.email}</p>
                        </div>

                        <div className="info-group">
                            <label>Location</label>
                            {isEditingLocation ? (
                                <div className="location-edit-mode">
                                    <input
                                        type="text"
                                        value={locationInput}
                                        onChange={(e) => setLocationInput(e.target.value)}
                                        className="location-input"
                                        placeholder="e.g., Amman, Jordan"
                                    />
                                    {/* Using your global buttons */}
                                    <button onClick={handleLocationSave} className="btn primary-btn">Save</button>
                                    <button onClick={() => setIsEditingLocation(false)} className="btn secondary-btn">Cancel</button>
                                </div>
                            ) : (
                                <div className="location-view-mode">
                                    <p>{profile.userLocation || 'No location added'}</p>
                                    {isOwner&& (
                                        <button
                                        onClick={() => {
                                            setLocationInput(profile.userLocation || '');
                                            setIsEditingLocation(true);
                                        }}
                                        className="btn-edit"
                                    >
                                        Edit
                                    </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Posts List */}
                <div className="posts-list">
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                            Loading posts...
                        </div>
                    ) : posts.length > 0 ? (
                        posts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                            No posts found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}