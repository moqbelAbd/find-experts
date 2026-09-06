import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from "../../../api/axiosClient.js";
import { Search, MapPin, Star } from 'lucide-react';
import './find-experts.css';

export default function FindExperts() {
    const navigate = useNavigate();
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [availableFields, setAvailableFields] = useState([]);
    // Filter State
    const [filters, setFilters] = useState({
        search: '',
        fieldId: '',
        minRating: '',
        hasGuarantees: false,
        minGuarantees: '',
        minExperience: '',
        maxPrice: ''
    });

    //fetch the fields when the component mounts
    useEffect(() => {
        const fetchFields = async () => {
            try {
                // Adjust this endpoint to match your actual fields endpoint
                const response = await axiosClient.get('/Field');
                setAvailableFields(response.data.data || []);
            } catch (error) {
                console.error("Failed to fetch fields", error);
            }
        };
        fetchFields();
    }, []);

    // Debounce search input to avoid excessive API calls
    useEffect(() => {
        const fetchExperts = async () => {
            setLoading(true);
            try {
                // Build query string dynamically
                const params = new URLSearchParams();
                if (filters.search) params.append('search', filters.search);
                if (filters.fieldId) params.append('fieldId', filters.fieldId);
                if (filters.hasGuarantees) params.append('hasGuarantees', true);
                if (filters.minGuarantees) params.append('minGuarantees', filters.minGuarantees);
                if (filters.minExperience) params.append('minExperience', filters.minExperience);
                if (filters.minRating) params.append('minGuarantees', filters.minRating);
                if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

                const response = await axiosClient.get(`/ExpertProfile?${params.toString()}`);
                setExperts(response.data.data);
            } catch (error) {
                console.error("Failed to fetch experts", error);
            } finally {
                setLoading(false);
            }
        };

        const timerId = setTimeout(() => {
            fetchExperts();
        }, 300); // 300ms delay to refetch after filtering

        return () => clearTimeout(timerId);
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="find-experts-layout">
            {/* Sidebar Filters */}
            <aside className="filters-sidebar">
                <h3>Filters</h3>

                <div className="filter-group">
                    <label>Search Name, Field, Job or Location</label>
                    <div className="search-input-wrapper">
                        <input
                            type="text"
                            name="search"
                            placeholder="e.g. Ahmed, Backend"
                            value={filters.search}
                            onChange={handleFilterChange}
                        />
                        <Search size={18} className="search-icon" />

                    </div>
                </div>

                <div className="filter-group">
                    <label>Expertise Field</label>
                    <select
                        name="fieldId"
                        value={filters.fieldId}
                        onChange={handleFilterChange}
                        className="form-input"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    >
                        <option value="">All Fields</option>
                        {availableFields.map(field => (
                            <option key={field.fieldId} value={field.fieldId}>
                                {field.name || field.fieldName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Max Price per Session ($)</label>
                    <input
                        type="number"
                        name="maxPrice"
                        placeholder="Any amount"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                    />
                </div>

                <div className="filter-group">
                    <label>Minimum Rating</label>
                    <select
                        name="minRating"
                        value={filters.minRating}
                        onChange={handleFilterChange}
                        className="form-input rating-dropdown"
                    >
                        <option value="">Any Rating</option>
                        <option value="1.0">1 ★ & up</option>
                        <option value="2.0">2 ★ & up</option>
                        <option value="3.0">3 ★ & up</option>
                        <option value="4.0">4 ★ & up</option>
                        <option value="5.0">5 ★</option>
                    </select>
                </div>

                <div className="filter-row">
                    <div className="filter-group half-width">
                        <label>Min Guarantees</label>
                        <input
                            type="number"
                            name="minGuarantees"
                            placeholder="0"
                            value={filters.minGuarantees}
                            onChange={handleFilterChange}
                            className="form-input"
                        />
                    </div>

                    <div className="filter-group half-width">
                        <label>Min Experience</label>
                        <input
                            type="number"
                            name="minExperience"
                            placeholder="0"
                            value={filters.minExperience || ''}
                            onChange={handleFilterChange}
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="filter-checkbox">
                    <input
                        type="checkbox"
                        id="hasGuarantees"
                        name="hasGuarantees"
                        checked={filters.hasGuarantees}
                        onChange={handleFilterChange}
                    />
                    <label htmlFor="hasGuarantees">Must have guarantees</label>
                </div>
            </aside>

            {/* Experts Grid */}
            <main className="experts-content">
                <div className="results-header">
                    <h2>Available Experts ({experts.length})</h2>
                </div>

                {loading ? (
                    <div className="loading-state">Loading experts...</div>
                ) : experts.length === 0 ? (
                    <div className="empty-state">No experts found matching your criteria.</div>
                ) : (
                    <div className="experts-grid">
                        {experts.map(expert => {
                            // Determine tier badge based on guarantees
                            const isGold = expert.guarantees > 10;
                            const isSilver = expert.guarantees > 0 && expert.guarantees <= 10;
                            const badgeClass = isGold ? 'badge-gold' : isSilver ? 'badge-silver' : 'badge-default';
                            const cardBorder = isGold ? 'border-gold' : isSilver ? 'border-silver' : '';

                            return (
                                <div key={expert.expertProfileId} className={`expert-card ${cardBorder}`}>

                                    <div className="card-header">
                                        <div className="profile-img-container">
                                            <img src={expert.profilePicture || '/default-avatar.png'} alt={expert.fullName} />
                                            <span className="status-dot"></span>
                                        </div>
                                        <div className="header-info">
                                            <h3 className="expert-name">{expert.fullName}</h3>
                                            <p className="expert-title">{expert.jobTitle}</p>
                                            <div className="expert-rating">
                                                <Star size={14} className="star-icon" fill="currentColor" />
                                                <span className="rating-score">{expert.rating.toFixed(1)}</span>
                                                <span className="review-count">({expert.numberOfReviews})</span>
                                            </div>
                                        </div>
                                        <div className="header-price">
                                            <h4>${expert.startingPrice || '--'}</h4>
                                            <span>/session</span>
                                        </div>
                                    </div>

                                    {expert.guarantees > 0 && (
                                        <div className={`guarantee-badge ${badgeClass}`}>
                                            <span className="badge-dot"></span>
                                            {isGold ? 'Gold Expert' : 'Silver Expert'} · {expert.guarantees} guarantees
                                        </div>
                                    )}

                                    <p className="expert-bio">{expert.bio?.substring(0, 120)}...</p>

                                    <div className="skills-tags">
                                        {expert.skills.slice(0, 4).map((skill, i) => (
                                            <span key={i} className="skill-tag">{skill}</span>
                                        ))}
                                        {expert.skills.length > 5 && (
                                            <span className="skill-tag extra-tag">+{expert.skills.length - 5}</span>
                                        )}
                                    </div>

                                    <div className="expert-meta">
                                        <span> <strong>Field: </strong> {expert.fieldName},</span>
                                        <span>{expert.totalExperienceYears}y experience</span>
                                    </div>
                                    <div className="expert-meta">
                                      <span><MapPin size={14} /> {expert.location || 'Remote'}</span>
                                    </div>

                                    <div className="card-actions">
                                        <button
                                            className="btn secondary-btn btn-outline"
                                            onClick={() => navigate(`/expert/${expert.expertProfileId}`)}>
                                            View Profile
                                        </button>
                                        { expert.consultationEnabled && (
                                        <button className="btn btn-primary">Book</button>
                                            )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}