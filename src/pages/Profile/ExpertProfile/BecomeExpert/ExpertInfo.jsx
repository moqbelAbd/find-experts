import React, {useEffect, useState} from 'react';
import axiosClient from "../../../../api/axiosClient.js";
import toast from 'react-hot-toast';
import { Globe } from 'lucide-react';
import {IconBrandGithub, IconBrandLinkedin} from "@tabler/icons-react"

export default function ExpertInfo({ formData, updateFormData, nextStep }) {

    const [fields, setFields] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFields = async () => {
            try {
                // We will build this backend endpoint later!
                const response = await axiosClient.get('/Field');
                setFields(response.data.data || []);
            } catch (error) {
                console.error("Error fetching fields:", error);
                const backendData = error.response?.data;
                const errorMessage = backendData?.message || backendData?.errors?.[0] || 'Failed to load fields.';
                toast.error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFields();
    }, []);

    const handleChange = (e) => {
        updateFormData({ [e.target.name]: e.target.value });
    };

    return (
        <div className="step-content">
            <h2 className="step-title">Professional Info</h2>

            <div className="form-group">
                <label>Professional title</label>
                <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="e.g. Senior Software Engineer" className="form-input" />
            </div>

            <div className="form-group">
                <label>Field of expertise</label>
                <select
                    name="fieldId"
                    value={formData.fieldId}
                    onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({
                            ...prev,
                            fieldId: val,
                            // Clear the custom text if they switch back to a predefined field
                            customField: val === 'other' ? prev.customField : ''
                        }));
                    }}
                    className="form-input"
                    disabled={isLoading}
                >
                    <option value="">{isLoading ? "Loading fields..." : "Select a field..."}</option>

                    <option value="other">Other (Please specify)</option>
                    {fields.map((field) => (
                        <option key={field.fieldId} value={field.fieldId}>
                            {field.fieldName}
                        </option>
                    ))}
                </select>

                {/* Conditionally render custom input when "Other" is selected */}
                {formData.fieldId === 'other' && (
                    <input
                        type="text"
                        name="customField"
                        value={formData.customField || ''}
                        onChange={handleChange}
                        placeholder="Enter your custom field name"
                        className="form-input"
                        style={{ marginTop: '8px' }}
                        required
                    />
                )}
            </div>

            <div className="form-group">
                <label>Professional bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" className="form-input" placeholder="Tell us about yourself..."></textarea>
                <span className="input-hint">Be specific. This is the first thing people read when they find you.</span>
            </div>

            <div className="form-group">
                <label>Years of experience</label>
                <input type="number" name="totalExperienceYears" value={formData.totalExperienceYears} onChange={handleChange} className="form-input" min={0} max={50}/>
            </div>

            <hr className="section-divider" style={{ margin: '32px 0' }} />

            <h3 className="sub-section-title" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Links (Optional)</h3>

            <div className="form-group">
                <label>LinkedIn</label>
                <div className="input-with-icon">
                    <IconBrandLinkedin size={18} className="input-icon" style={{color: 'green'}} />
                    <input
                        type="url"
                        name="linkedInUrl"
                        value={formData.linkedInUrl}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/..."
                        className="form-input icon-padded"
                    />
                </div>
            </div>

            <div className="form-group">
                <label>GitHub</label>
                <div className="input-with-icon">
                    <IconBrandGithub size={18} className="input-icon" style={{color: 'green'}} />
                    <input
                        type="url"
                        name="githubUrl"
                        value={formData.githubUrl}
                        onChange={handleChange}
                        placeholder="https://github.com/..."
                        className="form-input icon-padded"
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Portfolio / Website</label>
                <div className="input-with-icon">
                    <Globe size={18} className="input-icon" style={{color: 'green'}}/>
                    <input
                        type="url"
                        name="portfolioUrl"
                        value={formData.portfolioUrl}
                        onChange={handleChange}
                        placeholder="https://yourwebsite.com"
                        className="form-input icon-padded"
                    />
                </div>
            </div>

            <div className="step-actions">
                <button
                    onClick={nextStep}
                    className="btn primary-btn full-width"
                    // Prevent continuing if required fields are empty
                    disabled={!formData.jobTitle || !formData.fieldId || !formData.bio}
                >
                    Continue
                </button>
            </div>

        </div>
    );
}