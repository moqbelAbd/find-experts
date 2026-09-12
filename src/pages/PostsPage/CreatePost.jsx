import React, { useState, useEffect } from 'react';
import axiosClient from "../../api/axiosClient";
import { Plus,ImagePlus, X, HelpCircle, Briefcase, Wrench } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './create-post.css';
import {useNavigate} from "react-router-dom";

export default function CreatePost({isEdit = false, initialData = null, postId = null}) {    // --- Form State ---

    const navigate = useNavigate();

    // --- Auxiliary State ---
    const [tagInput, setTagInput] = useState('');
    const [fields, setFields] = useState([]);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);


    const [restrictToFieldExperts, setRestrictToFieldExperts] = useState(
        isEdit && initialData ? (initialData.restrictToFieldExperts || false) : false
    );
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(
        isEdit && initialData ? (initialData.attachedPhoto || null) : null
    );

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

    const [formData, setFormData] = useState(() => {
        if (isEdit && initialData) {
        let mappedTypeId = 1;
    const typeStr = String(initialData.type || initialData.postTypeId || '').toUpperCase();
    if (typeStr === '2' || typeStr === 'SERVICE') mappedTypeId = 2;
    if (typeStr === '3' || typeStr === 'JOB') mappedTypeId = 3;

    //  Pre-fill form if editing
            return{
                postTypeId: mappedTypeId,
                postTitle: initialData.postTitle || '',
                postDescription: initialData.postContent || '',
                fieldId: initialData.fieldId || '',
                tags: initialData.tags || [],
                postDeadLine: initialData.postDeadLine ? initialData.postDeadLine.split('T')[0] : '',
                budget: initialData.budget || '',
                company: initialData.company || '',
                expectedSalary: initialData.expectedSalary || '',
                workLocationTypeId: initialData.workLocationType || '',
                jobLocation: initialData.jobLocation || '',
                employmentTypeId: initialData.employmentType || ''
            };
        }
        // Default empty state for creating a NEW post
        return {
            postTypeId: 1,
            postTitle: '',
            postDescription: '',
            fieldId: '',
            tags: [],
            postDeadLine: '',
            budget: '',
            company: '',
            expectedSalary: '',
            workLocationTypeId: '',
            jobLocation: '',
            employmentTypeId: ''
        };
    });

    //  Fetch Fields
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

        //  Fetch Skills based on Field
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
        if (isEdit) return;
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


    // Handle photo selection
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const removePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const submitData = new FormData();

            // --- Base Fields ---
            submitData.append('PostTypeId', formData.postTypeId);
            submitData.append('PostTitle', formData.postTitle);
            submitData.append('PostDescription', formData.postDescription);
            submitData.append('FieldId', formData.fieldId);
            submitData.append('RestrictToFieldExperts', restrictToFieldExperts);

            if (isEdit && postId) {
                submitData.append('PostId', postId);
            }

            // --- Photo ---
            if (photoFile) {
                submitData.append('AttachedPhoto', photoFile);
            }

            // --- Tags ---
            formData.tags.forEach(tag => {
                submitData.append('Tags', tag);
            });

            // --- Extended Fields ---
            if (formData.postTypeId === 2 || formData.postTypeId === 3) {
                if (formData.postDeadLine) {
                    submitData.append('PostDeadLine', formData.postDeadLine);
                }
            }

            if (formData.postTypeId === 2 && formData.budget) {
                submitData.append('Budget', formData.budget);
            }

            if (formData.postTypeId === 3) {
                submitData.append('Company', formData.company);
                submitData.append('WorkLocationTypeId', formData.workLocationTypeId);
                submitData.append('EmploymentTypeId', formData.employmentTypeId);

                if (formData.expectedSalary) {
                    submitData.append('ExpectedSalary', formData.expectedSalary);
                }
                if (formData.workLocationTypeId === '1' && formData.jobLocation) {
                    submitData.append('JobLocation', formData.jobLocation);
                }
            }

            // --- API Call ---
            const config = {
                headers: {'Content-Type': 'multipart/form-data'}
            };

            if (isEdit) {
                await axiosClient.put('/post', submitData, config);
                toast.success("Post updated successfully");
            } else {
                await axiosClient.post('/Post', submitData, config);
                toast.success("Post created successfully");
            }

            navigate(`/posts`);

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} post.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];
    return (
        <div className="create-post-wrapper container">
            <h2 className="section-title">{isEdit ? 'Edit Post' : 'Create a New Post'}</h2>
            {error && <div className="form-error">{error}</div>}

            <form onSubmit={handleSubmit}>

                {/* --- 1. POST TYPE GRID --- */}
                {!isEdit&& (
                    <div className="type-grid">
                    <button
                        type="button"
                        className={`type-button ${formData.postTypeId === 1 ? 'active' : ''}`}
                        disabled={isEdit}
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
                )}

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
                        <select name="fieldId" className="form-control" value={formData.fieldId} onChange={handleInputChange} >
                            <option value="">Select a field...</option>
                            {fields.map(f => (
                                <option key={f.fieldId } value={f.fieldId }>{f.fieldName }</option>
                            ))}
                        </select>
                    </div>

                    {/* --- Photo Upload Section --- */}
                    <div className="photo-upload-container">
                        {!photoPreview ? (
                            <div>
                                <input
                                    type="file"
                                    id="post-photo-upload"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handlePhotoChange}
                                />
                                <label htmlFor="post-photo-upload" className="btn secondary-btn">
                                    <ImagePlus size={18} style={{ marginRight: '8px' }} />
                                    Attach Photo
                                </label>
                            </div>
                        ) : (
                            <div className="photo-preview-box">
                                <img src={photoPreview} alt="Preview" />
                                <button type="button" className="btn-remove-photo" onClick={removePhoto}>
                                    <X size={16} />
                                </button>
                            </div>
                        )}
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


                {/* --- Restriction Checkbox (Only show if a field is selected) --- */}
                {formData.fieldId && (
                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id="restrictExperts"
                            checked={restrictToFieldExperts}
                            onChange={(e) => setRestrictToFieldExperts(e.target.checked)}
                        />
                        <label htmlFor="restrictExperts">
                            Restrict interactions (comments/interests) to experts in this field only
                        </label>
                    </div>
                )}

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

                    <button type="submit" className="btn primary-btn" disabled={isSubmitting}>
                        {isSubmitting ?
                            (isEdit ? 'Saving...' : 'Publishing...')
                            : (isEdit ? 'Save Changes' : 'Publish Post')}
                    </button>
                </div>
            </form>
        </div>
    );
}