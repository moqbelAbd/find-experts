import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import axiosClient from "../../api/axiosClient.js";
import './posts-page.css';
import PostCard
    from "../../components/common/PostCard.jsx";

export default function PostsPage() {
    // API State
    const [posts, setPosts] = useState([]);
    const [availableFields, setAvailableFields] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [fieldFilter, setFieldFilter] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const getTypeId = (tabName) => {
        switch (tabName) {
            case 'QUESTION': return 1;
            case 'SERVICE': return 2;
            case 'JOB': return 3;
            default: return undefined; // 'ALL' sends undefined, meaning no filter is applied
        }
    };

    useEffect(() => {
        const fetchFields = async () => {
            try {
                const response = await axiosClient.get('/Field');
                setAvailableFields(response.data.data || []);
            } catch (error) {
                console.error("Failed to fetch fields", error);
            }
        };
        fetchFields();
    }, []);

    // Fetch data from backend on mount
    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const response = await axiosClient.get('/post',
                    {
                        params:{
                            search: searchQuery || undefined,
                            fieldId: fieldFilter || undefined,
                            typeId: getTypeId(activeTab),
                            sortBy: sortBy
                        }
                    });

                const fetchedData = response.data?.data || response.data;

                    setPosts(fetchedData);
            } catch (error) {
                console.warn("error fetching posts", error);
            setPosts([]);

            } finally {
                setIsLoading(false);
            }
        };

        const delay = setTimeout(() =>{
            fetchPosts();
        },300 );

        return ()=> clearTimeout(delay);
    }, [fieldFilter, sortBy, searchQuery, activeTab]);


    return (
        <div className="posts-page-container">

            {/* Header Section */}
            <div className="posts-header">
                <div className="header-text">
                    <h3>Posts</h3>
                    <p>Questions, service requests, and jobs from the community</p>
                </div>
                <Link to = '/create-post' className="btn-create-post">
                    <Plus size={20} /> Create Post
                </Link>
            </div>

            {/* Filter & Search Bar Section */}
            <div className="posts-filters-container">

                {/* . Fixed Search Box */}
                <div className="search-wrapper">
                    <Search size={18} className="search-icon-inline" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {/* 1. Post Type */}
                <div className="segmented-control">
                    <button className={activeTab === 'ALL' ? 'active' : ''} onClick={() => setActiveTab('ALL')}>
                        All
                    </button>
                    <button className={activeTab === 'QUESTION' ? 'active' : ''} onClick={() => setActiveTab('QUESTION')}>
                        Questions
                    </button>
                    <button className={activeTab === 'SERVICE' ? 'active' : ''} onClick={() => setActiveTab('SERVICE')}>
                        Services
                    </button>
                    <button className={activeTab === 'JOB' ? 'active' : ''} onClick={() => setActiveTab('JOB')}>
                        Jobs
                    </button>
                </div>


                {/* 3. Standard Dropdowns */}
                <div className="filter-dropdowns">
                    <select value={fieldFilter} onChange={(e) => setFieldFilter(e.target.value)} className="filter-select">
                        <option value="">All Fields</option>
                        {availableFields.map(field => {
                            return (
                                <option key={field.fieldId } value={field.fieldId }>
                                    {field.name || field.fieldName}
                                </option>
                            );
                        })}
                    </select>

                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
                        <option value="newest">New Posts</option>
                        <option value="recent_activity">Recent Activity</option>
                    </select>
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
                        No posts found matching your criteria.
                    </div>
                )}
            </div>

        </div>
    );

}