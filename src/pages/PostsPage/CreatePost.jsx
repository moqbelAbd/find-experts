import React, { useState, useEffect } from 'react';
import axiosClient from "../../api/axiosClient";
import { Plus, X, HelpCircle, Briefcase, Wrench } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './create-post.css';
import {useNavigate} from "react-router-dom";

export default function CreatePost() {
    // --- Form State ---
    const [formData, setFormData] = useState({
        postTypeId: 1,
        postTitle: '',
        postDescription: '',
        fieldId: '',
        tags: [],
        postDeadLine: '',
        budget: '',
        company: '',
        JobLocation: '',
        expectedSalary: '',
        workLocationTypeId: '',
        jobLocation: '',
        employmentTypeId: ''
    });

    const navigate = useNavigate();

    // --- Auxiliary State ---
    const [tagInput, setTagInput] = useState('');
    const [fields, setFields] = useState([]);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const workLocationOptions = [
        { id: 1, name: 'On-Site' },
        { id: 2, name: 'Hybrid' },
        { id: 3, name: 'Remote' }
    ];

    const employmentTypeOptions = [
        { id: 1, name: 'Full-Time' },
        { id: 2, name: 'Part-Time' },
        { id: 3, name: 'Contract' },
        { id: 4, name: 'Freelance' }
    ];

    // --- Effects ---
    useEffect(() => {
        const fetchFields = async () => {
            try {
                const response = await axiosClient.get('/Field');
                setFields(response.data?.data || response.data || []);
            } catch (err) {
                console.error("Failed to fetch fields", err);
            }
        };
        fetchFields();
    }, []);

    useEffect(() => {
        const fetchSkills = async () => {
            if (!formData.fieldId) {
                setAvailableSkills([]);
                return;
            }
            try {
                const response = await axiosClient.get(`/Skill/by-field/${formData.fieldId}`);
                setAvailableSkills(response.data?.data || response.data || []);
            } catch (err) {
                console.error("Failed to fetch skills", err);
            }
        };
        fetchSkills();
    }, [formData.fieldId]);

    // --- Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'workLocationTypeId' && value !== '1' ? { jobLocation: '' } : {})
        }));
    };

    const handleTypeSelect = (typeId) => {
        setFormData(prev => ({ ...prev, postTypeId: typeId }));
    };

    const addTag = (tagName) => {
        const trimmed = tagName.trim();
        if (trimmed && !formData.tags.includes(trimmed)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
        }
        setTagInput('');
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                postTypeId: formData.postTypeId,
                postTitle: formData.postTitle,
                postDescription: formData.postDescription,
                fieldId: parseInt(formData.fieldId),
                tags: formData.tags,
            };

            if (formData.postTypeId === 2 || formData.postTypeId === 3) {
                payload.postDeadLine = formData.postDeadLine || null;
            }

            if (formData.postTypeId === 2) {
                payload.budget = formData.budget ? parseInt(formData.budget) : null;
            }

            if (formData.postTypeId === 3) {
                payload.company = formData.company;
                payload.JobLocation = formData.JobLocation;
                payload.expectedSalary = formData.expectedSalary ? parseInt(formData.expectedSalary) : null;
                payload.workLocationTypeId = formData.workLocationTypeId ? parseInt(formData.workLocationTypeId) : null;
                payload.employmentTypeId = formData.employmentTypeId ? parseInt(formData.employmentTypeId) : null;
                payload.jobLocation = formData.workLocationTypeId === '1' ? formData.jobLocation : null;
            }

            const response = await axiosClient.post('/Post', payload);
            toast.success("Post created successfully");
            navigate(`/posts`);

        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create post.");
        } finally {
            setIsSubmitting(false);
        }
    };
    const today = new Date().toISOString().split('T')[0];
    return (
        <div className="create-post-wrapper container">
            <h2 className="section-title">Create a New Post</h2>
            {error && <div className="form-error">{error}</div>}

            <form onSubmit={handleSubmit}>

                {/* --- 1. POST TYPE GRID --- */}
                <div className="type-grid">
                    <button
                        type="button"
                        className={`type-button ${formData.postTypeId === 1 ? 'active' : ''}`}
                        onClick={() => handleTypeSelect(1)}
                    >
                        <HelpCircle size={24} />
                        <h4>Question</h4>
                    </button>

                    <button
                        type="button"
                        className={`type-button ${formData.postTypeId === 2 ? 'active' : ''}`}
                        onClick={() => handleTypeSelect(2)}
                    >
                        <Wrench size={24} />
                        <h4>Service</h4>
                    </button>

                    <button
                        type="button"
                        className={`type-button ${formData.postTypeId === 3 ? 'active' : ''}`}
                        onClick={() => handleTypeSelect(3)}
                    >
                        <Briefcase size={24} />
                        <h4>Job</h4>
                    </button>
                </div>

                {/* --- 2. BASE FORM --- */}
                <div className="base-form-section">
                    <div className="form-group">
                        <label>Post Title *</label>
                        <input type="text" name="postTitle" className="form-control" value={formData.postTitle} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                        <label>Description *</label>
                        <textarea name="postDescription" className="form-control" value={formData.postDescription} onChange={handleInputChange} required rows={5} />
                    </div>

                    <div className="form-group">
                        <label>Field *</label>
                        <select name="fieldId" className="form-control" value={formData.fieldId} onChange={handleInputChange} required>
                            <option value="">Select a field...</option>
                            {fields.map(f => (
                                <option key={f.fieldId || f.id} value={f.fieldId || f.id}>{f.fieldName || f.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tags & Skills Integration */}
                    <div className="form-group">
                        <label>Tags (Select from skills below or type custom tag and press Enter)</label>
                        <div className="tag-input-group">
                            <input
                                type="text"
                                className="form-control"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); }}}
                                placeholder="Type a tag..."
                            />
                            {/* Uses your global button classes */}
                            <button type="button" className="btn secondary-btn" onClick={() => addTag(tagInput)}>Add</button>
                        </div>

                        <div className="selected-tags">
                            {formData.tags.map(tag => (
                                <span key={tag} className="tag-badge">
                                    {tag} <X size={14} onClick={() => removeTag(tag)} />
                                </span>
                            ))}
                        </div>

                        {availableSkills.length > 0 && (
                            <div className="skills-suggestions">
                                <small>Suggested Skills for this Field:</small>
                                <div className="skills-list">
                                    {availableSkills.map(skill => (
                                        <button
                                            type="button"
                                            key={skill.skillId || skill.id}
                                            className="skill-suggestion-btn"
                                            onClick={() => addTag(skill.skillName || skill.name)}
                                        >
                                            <Plus size={12} />
                                            {skill.skillName || skill.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- 3. EXTENDED FORM (Service or Job) --- */}
                {(formData.postTypeId === 2 || formData.postTypeId === 3) && (
                    <div className="extended-form-section">
                        <h3>{formData.postTypeId === 2 ? 'Service Details' : 'Job Details'}</h3>

                        <div className="form-group">
                            <label>Deadline / Due Date</label>
                            <input type="date" name="postDeadLine" className="form-control" value={formData.postDeadLine} onChange={handleInputChange} min={today}/>
                        </div>

                        {formData.postTypeId === 2 && (
                            <div className="form-group">
                                <label>Budget </label>
                                <input type="number" name="budget" className="form-control" value={formData.budget} onChange={handleInputChange} placeholder="e.g. 500" />
                            </div>
                        )}

                        {formData.postTypeId === 3 && (
                            <>
                                {/* ROW 1: Company Name & Employment Type */}
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Company Name *</label>
                                        <input type="text" name="company" className="form-control" value={formData.company} onChange={handleInputChange} required />
                                    </div>

                                    <div className="form-group">
                                        <label>Employment Type *</label>
                                        <select name="employmentTypeId" className="form-control" value={formData.employmentTypeId} onChange={handleInputChange} required>
                                            <option value="">Select...</option>
                                            {employmentTypeOptions.map(opt => (
                                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* ROW 2: Work Location Type, Job Location (Conditional), & Salary */}
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Work Location Type *</label>
                                        <select name="workLocationTypeId" className="form-control" value={formData.workLocationTypeId} onChange={handleInputChange} required>
                                            <option value="">Select...</option>
                                            {workLocationOptions.map(opt => (
                                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {formData.workLocationTypeId !== '3' && (
                                        <div className="form-group">
                                            <label>Job Location Address / City *</label>
                                            <input type="text" name="jobLocation" className="form-control" value={formData.jobLocation} onChange={handleInputChange} required />
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label>Expected Salary</label>
                                        <input type="number" name="expectedSalary" className="form-control" value={formData.expectedSalary} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="form-actions">
                    {/* Uses your global primary-btn class */}
                    <button type="submit" className="btn primary-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Publishing...' : 'Publish Post'}
                    </button>
                </div>
            </form>
        </div>
    );
}