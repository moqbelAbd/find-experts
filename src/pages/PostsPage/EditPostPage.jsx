import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import CreatePost from './CreatePost.jsx';

export default function EditPostPage() {
    const location = useLocation();
    const { id } = useParams();
    const navigate = useNavigate();

    // Check if data came from the button click
    const [postData, setPostData] = useState(location.state?.initialData || null);
    const [isLoading, setIsLoading] = useState(!postData);


    useEffect(() => {
        // If we don't have the data (e.g., user refreshed the page), fetch it from the backend
        if (!postData && id) {
            const fetchPost = async () => {
                try {
                    const response = await axiosClient.get(`/post/${id}`);
                    setPostData(response.data?.data || response.data);
                } catch (error) {
                    console.error("Failed to fetch post for editing", error);
                    navigate('/posts');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPost();
        }
    }, [id, postData, navigate]);

    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading post data...</div>;
    }

    if (!postData) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>No post data found.</div>;
    }

    return <CreatePost isEdit={true} initialData={postData} postId={id} />;
}