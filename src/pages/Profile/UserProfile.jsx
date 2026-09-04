import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosClient  from '/src/api/axiosClient.js'
import "./user-profile.css"

export default function UserProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [locationInput, setLocationInput] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axiosClient.get('/User/profile');
                setProfile(response.data.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

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

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!profile) return <div className="p-10 text-center text-red-500">Failed to load profile.</div>;

    const initials = profile.fullName ? profile.fullName.substring(0, 2).toUpperCase() : 'U';

    return (
        <div className="container">
            <div className="profile-page-wrapper">
                <div className="profile-header">
                    {/* Using your global section-title */}
                    <h1 className="section-title" style={{ marginBottom: 0 }}>My Profile</h1>

                    {!profile.hasExpertProfile && (

                        <Link to="/become-expert" className="btn primary-btn">
                        Go Expert
                        </Link>
                        )}
                </div>

                <div className="profile-content">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar-circle">
                            {profile.avatar ? (
                                <img src={profile.avatar} alt="Profile" />
                            ) : (
                                initials
                            )}
                        </div>

                        <button onClick={() => fileInputRef.current.click()} className="btn-upload-photo">
                            Upload Photo
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarUpload}
                            className="hidden-file-input"
                            accept="image/*"
                        />
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
                                    <button
                                        onClick={() => {
                                            setLocationInput(profile.userLocation || '');
                                            setIsEditingLocation(true);
                                        }}
                                        className="btn-edit"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}