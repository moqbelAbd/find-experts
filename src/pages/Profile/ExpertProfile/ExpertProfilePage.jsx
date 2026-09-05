import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from "../../../api/axiosClient.js";
import toast from 'react-hot-toast';
import { Globe, Briefcase, FolderGit2, Award, CalendarClock, Clock, Trash2, Plus } from 'lucide-react';
import { IconBrandGithub, IconBrandLinkedin } from "@tabler/icons-react";
import './expert-profile-page.css';
import { getUserIdFromToken } from "../../../utils/authUtils.js"

export default function ExpertProfilePage() {
    const { expertId } = useParams();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [availableFields, setAvailableFields] = useState([]);

    const currentUserId = getUserIdFromToken();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axiosClient.get(`/ExpertProfile/${expertId}`);
                setProfile(response.data.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("Could not load expert profile.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [expertId]);

    useEffect(() => {
        if (isEditing && availableFields.length === 0) {
            axiosClient.get('/Field')
                .then(res => setAvailableFields(res.data.data || []))
                .catch(err => console.error("Error fetching fields", err));
        }
    }, [isEditing, availableFields.length]);

    const handleLinkChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleArrayChange = (arrayName, index, field, value) => {
        const newArray = [...profile[arrayName]];
        newArray[index][field] = value;
        setProfile(prev => ({ ...prev, [arrayName]: newArray }));
    };

    const handleSkillChange = (index, value) => {
        const newSkills = [...profile.skills];
        newSkills[index] = value;
        setProfile(prev => ({ ...prev, skills: newSkills }));
    };

    const handleFileChange = (index, file) => {
        const newProjects = [...profile.projects];
        newProjects[index].imageFile = file;
        setProfile(prev => ({ ...prev, projects: newProjects }));
    };

    const removeItem = (arrayName, indexToRemove) => {
        setProfile(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleAddNew = (type) => {
        if (type === 'skill') {
            setProfile(prev => ({ ...prev, skills: [...prev.skills, ''] }));
        } else if (type === 'experience') {
            setProfile(prev => ({
                ...prev,
                experiences: [...prev.experiences, { jobTitle: '', companyName: '', startDate: '', endDate: '' }]
            }));
        } else if (type === 'project') {
            setProfile(prev => ({
                ...prev,
                projects: [...prev.projects, { projectTitle: '', projectDescription: '', projectUrl: '', projectImage: '', imageFile: null }]
            }));
        } else if (type === 'availability') {
            setProfile(prev => ({
                ...prev,
                availabilities: [...prev.availabilities, { dayOfWeek: 0, startTime: '09:00', endTime: '17:00' }]
            }));
        } else if (type === 'package') {
            setProfile(prev => ({
                ...prev,
                packages: [...prev.packages, { duration: 30, price: 0 }]
            }));

        } else if (type === 'certificate') {
            setProfile(prev => ({
                ...prev,
                certificates: [...prev.certificates, { certificateName: '', issuer: '', issueDate: '' }]
            }));
        }
    };

    const handleSave = async () => {
        const toastId = toast.loading('Saving changes...');
        const data = new FormData();

        data.append('JobTitle', profile.jobTitle);
        if (profile.fieldId && profile.fieldId !== 'other') {
            data.append('FieldId', profile.fieldId);
        } else if (profile.fieldName) {
            data.append('CustomField', profile.customField);
        }        data.append('Bio', profile.bio || '');
        data.append('TotalExperienceYears', profile.totalExperienceYears || 0);
        data.append('ConsultationEnabled', profile.consultationEnabled);
        if (profile.linkedInUrl) data.append('LinkedInUrl', profile.linkedInUrl);
        if (profile.githubUrl) data.append('GithubUrl', profile.githubUrl);
        if (profile.portfolioUrl) data.append('PortfolioUrl', profile.portfolioUrl);

        profile.skills.forEach((skill, index) => {
            if (skill.trim()) data.append(`Skills[${index}]`, skill);
        });

        profile.experiences.forEach((exp, index) => {
            if (exp.jobTitle && exp.companyName) {
                data.append(`Experiences[${index}].JobTitle`, exp.jobTitle);
                data.append(`Experiences[${index}].CompanyName`, exp.companyName);
                data.append(`Experiences[${index}].From`, exp.startDate);
                if (exp.endDate) data.append(`Experiences[${index}].To`, exp.endDate);
            }
        });

        profile.projects.forEach((proj, index) => {
            if (proj.projectTitle) {
                data.append(`Projects[${index}].ProjectTitle`, proj.projectTitle);
                data.append(`Projects[${index}].ProjectDescription`, proj.projectDescription);
                if (proj.projectUrl) data.append(`Projects[${index}].ProjectUrl`, proj.projectUrl);
                if (proj.projectImage) data.append(`Projects[${index}].ExistingImageUrl`, proj.projectImage);
                if (proj.imageFile) data.append(`Projects[${index}].ImageFile`, proj.imageFile);
            }
        });

        profile.certificates.forEach((cert, index) => {
            if (cert.certificateName && cert.issuer) {
                data.append(`Certificates[${index}].CertificateName`, cert.certificateName);
                data.append(`Certificates[${index}].Issuer`, cert.issuer);
                if (cert.issueDate) data.append(`Certificates[${index}].IssueDate`, cert.issueDate);
            }
        });

        if (profile.consultationEnabled) {
            profile.availabilities.forEach((avail, index) => {
                data.append(`Availabilities[${index}].DayOfWeek`, avail.dayOfWeek);
                data.append(`Availabilities[${index}].StartTime`, avail.startTime);
                data.append(`Availabilities[${index}].EndTime`, avail.endTime);
            });

            profile.packages.forEach((pkg, index) => {
                data.append(`Packages[${index}].Duration`, pkg.duration);
                data.append(`Packages[${index}].Price`, pkg.price);
            });
        }

        try {
            await axiosClient.put('/ExpertProfile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Changes saved!', { id: toastId });
            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            toast.error('Failed to save changes', { id: toastId });
        }
    };

    const handleCancel = () => {
        window.location.reload();
    };

    if (isLoading) return <div className="container expert-profile-container">Loading profile...</div>;
    if (!profile) return <div className="container expert-profile-container">Profile not found.</div>;

    const isOwner = currentUserId === profile.userId;

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const formatTime12Hour = (timeStr) => {
        if (!timeStr) return '';

        // Split the "HH:mm:ss" string from the backend
        const [hourString, minuteString] = timeStr.split(':');
        let hour = parseInt(hourString, 10);

        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12; // Converts 0 to 12, 13 to 1, etc.

        return `${hour}:${minuteString} ${ampm}`;
    };

    return (
        <div className="container expert-profile-container">

            {isOwner && (
                <div className="edit-actions-header">
                    {isEditing ? (
                        <>
                            <button onClick={handleCancel} className="btn secondary-btn">Cancel</button>
                            <button onClick={handleSave} className="btn primary-btn">Save Changes</button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="btn outline-btn">Edit Profile</button>
                    )}
                </div>
            )}

            <div className="expert-section expert-form-card">
                <div className="expert-header-layout">
                    <img
                        src={profile.profilePicture || '/default-avatar.png'}
                        alt={profile.fullName}
                        className="expert-avatar"
                    />
                    <div style={{ flex: 1 }}>
                        <h1 className="expert-name">{profile.fullName}</h1>
                        {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                                <input type="text" name="jobTitle" value={profile.jobTitle || ''} onChange={handleLinkChange} placeholder="Job Title" className="form-input" />

                                <select
                                    name="fieldId"
                                    value={profile.fieldId || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setProfile(prev => ({
                                            ...prev,
                                            fieldId: val,
                                            // Clear the custom text if they switch back to a predefined field
                                            customField: val === 'other' ? prev.customField : ''
                                        }));
                                    }}
                                    className="form-input"
                                >

                                    <option value="">Select a field...</option>
                                    <option value="other">Other (Please specify)</option>

                                    {availableFields.map(f => (
                                        <option key={f.fieldId} value={f.fieldId}>{f.fieldName}</option>
                                    ))}
                                </select>

                                {/* Conditionally render custom input when "Other" is selected */}
                                {profile.fieldId === 'other' && (
                                    <input
                                        type="text"
                                        name="customField"
                                        value={profile.customField || ''}
                                        onChange={handleLinkChange}
                                        placeholder="Enter your custom field name"
                                        className="form-input"
                                        required
                                    />
                                )}
                            </div>
                        ) : (
                            <>
                                <h2 className="expert-title">{profile.jobTitle}</h2>
                                <p className="expert-field">{profile.fieldName}</p>
                            </>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <textarea name="bio" value={profile.bio || ''} onChange={handleLinkChange} placeholder="Bio details..." rows="4" className="form-input" style={{ marginTop: '16px' }} />
                ) : (
                    <p className="expert-bio">{profile.bio}</p>
                )}

                <div className="expert-social-links">
                    {isEditing ? (
                        <>
                            <div className="edit-link-group">
                                <IconBrandLinkedin size={20} className="social-icon-green" />
                                <input type="url" name="linkedInUrl" value={profile.linkedInUrl || ''} onChange={handleLinkChange} placeholder="LinkedIn URL" className="form-input" />
                            </div>
                            <div className="edit-link-group">
                                <IconBrandGithub size={20} className="social-icon-green" />
                                <input type="url" name="githubUrl" value={profile.githubUrl || ''} onChange={handleLinkChange} placeholder="GitHub URL" className="form-input" />
                            </div>
                            <div className="edit-link-group">
                                <Globe size={20} className="social-icon-green" />
                                <input type="url" name="portfolioUrl" value={profile.portfolioUrl || ''} onChange={handleLinkChange} placeholder="Portfolio URL" className="form-input" />
                            </div>
                        </>
                    ) : (
                        <>
                            {profile.linkedInUrl && (
                                <a href={profile.linkedInUrl} target="_blank" rel="noreferrer" className="social-icon-link">
                                    <IconBrandLinkedin size={24} className="social-icon-green" />
                                </a>
                            )}
                            {profile.githubUrl && (
                                <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="social-icon-link">
                                    <IconBrandGithub size={24} className="social-icon-green" />
                                </a>
                            )}
                            {profile.portfolioUrl && (
                                <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="social-icon-link">
                                    <Globe size={24} className="social-icon-green" />
                                </a>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Skills Section */}
            {(profile.skills.length > 0 || isEditing) && (
                <div className="expert-section expert-form-card">
                    <div className="section-header-row mb-16">
                        <h3 className="list-section-header">Skills</h3>
                        {isEditing && (
                            <button className="btn outline-btn add-btn" onClick={() => handleAddNew('skill')}>
                                <Plus size={16} /> Add
                            </button>
                        )}
                    </div>
                    <div className={isEditing ? 'edit-skills-container' : 'skills-container'} style={isEditing ? { display: 'flex', flexDirection: 'column', gap: '8px' } : {}}>
                        {profile.skills.map((skill, i) => (
                            isEditing ? (
                                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input type="text" value={skill} onChange={(e) => handleSkillChange(i, e.target.value)} placeholder="Skill name" className="form-input" />
                                    <button onClick={() => removeItem('skills', i)} className="icon-delete-btn"><Trash2 size={18} /></button>
                                </div>
                            ) : (
                                <span key={i} className="skill-chip selected">{skill}</span>
                            )
                        ))}
                        {profile.skills.length === 0 && isEditing && <p className="empty-state-text">No skills added yet.</p>}
                    </div>
                </div>
            )}

            {/* Experience Section */}
            {(profile.experiences.length > 0 || isEditing) && (
                <div className="expert-section expert-form-card">
                    <div className="section-header-row">
                        <h3 className="list-section-header"><Briefcase size={20} /> Experience</h3>
                        {isEditing && (
                            <button className="btn outline-btn add-btn" onClick={() => handleAddNew('experience')}>
                                <Plus size={16} /> Add
                            </button>
                        )}
                    </div>
                    {profile.experiences.map((exp, i) => (
                        <div key={i} className="list-item-row" style={{ flexDirection: isEditing ? 'column' : 'row', gap: '16px' }}>
                            {isEditing ? (
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <input type="text" placeholder="Job Title" value={exp.jobTitle || ''} onChange={(e) => handleArrayChange('experiences', i, 'jobTitle', e.target.value)} className="form-input" />
                                    <input type="text" placeholder="Company Name" value={exp.companyName || ''} onChange={(e) => handleArrayChange('experiences', i, 'companyName', e.target.value)} className="form-input" />
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Start Date</label>
                                            <input type="date" value={exp.startDate ? exp.startDate.split('T')[0] : ''} onChange={(e) => handleArrayChange('experiences', i, 'startDate', e.target.value)} className="form-input" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>End Date (Leave empty if present)</label>
                                            <input type="date" value={exp.endDate ? exp.endDate.split('T')[0] : ''} onChange={(e) => handleArrayChange('experiences', i, 'endDate', e.target.value)} className="form-input" />
                                        </div>
                                    </div>
                                    <button onClick={() => removeItem('experiences', i)} className="icon-delete-btn" style={{ alignSelf: 'flex-start' }}><Trash2 size={16} /> Remove Experience</button>
                                </div>
                            ) : (
                                <>
                                    <div className="list-item-content">
                                        <h4>{exp.jobTitle}</h4>
                                        <p className="item-subtitle">{exp.companyName}</p>
                                        <p className="item-date">
                                            {new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    {profile.experiences.length === 0 && isEditing && <p className="empty-state-text">No experience records added.</p>}
                </div>
            )}

            {/* Certificates Section */}
            {(profile.certificates?.length > 0 || isEditing) && (
                <div className="expert-section expert-form-card">
                    <div className="section-header-row">
                        <h3 className="list-section-header"><Award size={20} /> Certificates</h3>
                        {isEditing && (
                            <button className="btn outline-btn add-btn" onClick={() => handleAddNew('certificate')}>
                                <Plus size={16} /> Add
                            </button>
                        )}
                    </div>
                    {profile.certificates?.map((cert, i) => (
                        <div key={i} className="list-item-row" style={{ flexDirection: isEditing ? 'column' : 'row', gap: '16px' }}>
                            {isEditing ? (
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <input type="text" placeholder="Certificate Name" value={cert.certificateName || ''} onChange={(e) => handleArrayChange('certificates', i, 'certificateName', e.target.value)} className="form-input" />
                                    <input type="text" placeholder="Issuer (e.g., Coursera, Microsoft)" value={cert.issuer || ''} onChange={(e) => handleArrayChange('certificates', i, 'issuer', e.target.value)} className="form-input" />
                                    <div>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Issue Date</label>
                                        <input
                                            type="date"
                                            value={cert.issueDate ? cert.issueDate.split('T')[0] : ''}
                                            onChange={(e) => handleArrayChange('certificates', i, 'issueDate', e.target.value)}
                                            className="form-input"
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <button onClick={() => removeItem('certificates', i)} className="icon-delete-btn" style={{ alignSelf: 'flex-start' }}><Trash2 size={16} /> Remove Certificate</button>
                                </div>
                            ) : (
                                <div className="list-item-content">
                                    <h4>{cert.certificateName}</h4>
                                    <p className="item-subtitle">{cert.issuer}</p>
                                    <p className="item-date">
                                        {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : ''}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                    {profile.certificates?.length === 0 && isEditing && <p className="empty-state-text">No certificates added.</p>}
                </div>
            )}

            {/* Projects Section */}
            {(profile.projects.length > 0 || isEditing) && (
                <div className="expert-section expert-form-card">
                    <div className="section-header-row">
                        <h3 className="list-section-header"><FolderGit2 size={20} /> Projects</h3>
                        {isEditing && (
                            <button className="btn outline-btn add-btn" onClick={() => handleAddNew('project')}>
                                <Plus size={16} /> Add
                            </button>
                        )}
                    </div>

                    <div className={isEditing ? 'project-list-edit' : 'project-grid'} style={isEditing ? { display: 'flex', flexDirection: 'column', gap: '24px' } : {}}>
                        {profile.projects.map((proj, i) => (
                            <div key={i} className="project-card" style={isEditing ? { padding: '24px' } : {}}>
                                {isEditing ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <h4 style={{ margin: 0 }}>Edit Project {i + 1}</h4>
                                            <button onClick={() => removeItem('projects', i)} className="icon-delete-btn"><Trash2 size={18} /></button>
                                        </div>
                                        <input type="text" placeholder="Project Title" value={proj.projectTitle || ''} onChange={(e) => handleArrayChange('projects', i, 'projectTitle', e.target.value)} className="form-input" />
                                        <textarea placeholder="Description" value={proj.projectDescription || ''} onChange={(e) => handleArrayChange('projects', i, 'projectDescription', e.target.value)} rows="3" className="form-input" />
                                        <input type="url" placeholder="Live URL (Optional)" value={proj.projectUrl || ''} onChange={(e) => handleArrayChange('projects', i, 'projectUrl', e.target.value)} className="form-input" />
                                        <div>
                                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Project Image</label>
                                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(i, e.target.files[0])} className="form-input" />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {proj.projectImage && <img src={proj.projectImage} alt={proj.projectTitle} className="project-image" />}
                                        <div className="project-details">
                                            <h4>{proj.projectTitle}</h4>
                                            <p>{proj.projectDescription}</p>
                                            {proj.projectUrl && (
                                                <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="btn outline-btn project-link-btn">View Project</a>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                    {profile.projects.length === 0 && isEditing && <p className="empty-state-text">No projects added.</p>}
                </div>
            )}

            {/* Availability & Consultation Section */}
            {profile.consultationEnabled && (
                <div className="expert-section expert-form-card">

                    {/* Weekly Availability List */}
                    {(profile.availabilities.length > 0 || isEditing) && (
                        <div className="availability-section">
                            <div className="section-header-row">
                                <h3 className="list-section-header"><Clock size={20} /> Weekly Availability</h3>
                                {isEditing && (
                                    <button className="btn outline-btn add-btn" onClick={() => handleAddNew('availability')}>
                                        <Plus size={16} /> Add
                                    </button>
                                )}
                            </div>

                            {/* Conditionally apply the grid wrapper only in view mode */}
                            <div className={isEditing ? "" : "availability-grid"}>
                                {profile.availabilities.map((avail, i) => (
                                    <div key={i} className={isEditing ? "list-item-row" : "availability-card"}>
                                        {isEditing ? (
                                            <div style={{ display: 'flex', gap: '12px', width: '100%', alignItems: 'center' }}>
                                                <select value={avail.dayOfWeek} onChange={(e) => handleArrayChange('availabilities', i, 'dayOfWeek', parseInt(e.target.value))} className="form-input" style={{ flex: 1 }}>
                                                    {daysOfWeek.map((day, idx) => <option key={idx} value={idx}>{day}</option>)}
                                                </select>
                                                <input type="time" value={avail.startTime?.substring(0, 5) || ''} onChange={(e) => handleArrayChange('availabilities', i, 'startTime', e.target.value)} className="form-input" style={{ flex: 1 }} />
                                                <span style={{ color: 'var(--text-muted)' }}>to</span>
                                                <input type="time" value={avail.endTime?.substring(0, 5) || ''} onChange={(e) => handleArrayChange('availabilities', i, 'endTime', e.target.value)} className="form-input" style={{ flex: 1 }} />
                                                <button onClick={() => removeItem('availabilities', i)} className="icon-delete-btn"><Trash2 size={18} /></button>
                                            </div>
                                        ) : (
                                            <div className="list-item-content">
                                                <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary)' }}>{daysOfWeek[avail.dayOfWeek]}</h4>
                                                <p className="item-subtitle" style={{ margin: 0, fontWeight: '500' }}>
                                                    {formatTime12Hour(avail.startTime)} to {formatTime12Hour(avail.endTime)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {profile.availabilities.length === 0 && isEditing && <p className="empty-state-text">No availability schedule added.</p>}
                        </div>
                    )}

                    {/* Pricing Packages */}
                    {(profile.packages.length > 0 || isEditing) && (
                        <>
                            <div className="section-header-row">
                                <h3 className="list-section-header"><CalendarClock size={20} /> Consultation Packages</h3>
                                {isEditing && (
                                    <button className="btn outline-btn add-btn" onClick={() => handleAddNew('package')}>
                                        <Plus size={16} /> Add
                                    </button>
                                )}
                            </div>

                            <div className="package-grid">
                                {profile.packages.map((pkg, i) => (
                                    <div key={i} className="package-card" style={isEditing ? { textAlign: 'left' } : {}}>
                                        {isEditing ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Duration</label>
                                                    <button onClick={() => removeItem('packages', i)} className="icon-delete-btn" style={{ position: 'static', padding: '4px' }}><Trash2 size={16} /></button>
                                                </div>
                                                <select value={pkg.duration} onChange={(e) => handleArrayChange('packages', i, 'duration', parseInt(e.target.value))} className="form-input">
                                                    <option value={15}>15 Minutes</option>
                                                    <option value={30}>30 Minutes</option>
                                                    <option value={45}>45 Minutes</option>
                                                    <option value={60}>60 Minutes</option>
                                                </select>
                                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Price (USD)</label>
                                                <input type="number" value={pkg.price} onChange={(e) => handleArrayChange('packages', i, 'price', parseFloat(e.target.value) || 0)} className="form-input" min="0" step="0.01" />
                                            </div>
                                        ) : (
                                            <>
                                                <h4>{pkg.duration} Minutes</h4>
                                                <p className="package-price">${pkg.price}</p>
                                                <button className="btn primary-btn full-width">Book Session</button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {profile.packages.length === 0 && isEditing && <p className="empty-state-text">No pricing packages added.</p>}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}