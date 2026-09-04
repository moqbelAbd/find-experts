import React from 'react';
import { Trash2 } from 'lucide-react';

export default function ExpertProjects({ formData, updateFormData, nextStep, prevStep }) {

    const updateProject = (index, field, value) => {
        const newProjects = [...formData.projects];
        newProjects[index][field] = value;
        updateFormData({ projects: newProjects });
    };

    const addProject = () => {
        updateFormData({
            projects: [...formData.projects, { projectTitle: '', projectDescription: '', projectUrl: '', imageFile: null }]
        });
    };

    const removeProject = (indexToRemove) => {
        const newProjects = formData.projects.filter((_, index) => index !== indexToRemove);
        updateFormData({ projects: newProjects });
    };

    const handleImageChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            updateProject(index, 'imageFile', file);
        }
    };

    // Projects are also optional overall, but if started, title and description are required.
    const isFirstBlockEmpty = formData.projects.length === 1 &&
        !formData.projects[0].projectTitle &&
        !formData.projects[0].projectDescription;

    const isValid = isFirstBlockEmpty || formData.projects.every(proj =>
        proj.projectTitle.trim() && proj.projectDescription.trim()
    );

    return (
        <div className="step-content">
            <h2 className="step-title">Projects</h2>
            <p className="input-hint" style={{ marginBottom: '24px' }}>
                Share work you are proud of. Projects show real outcomes, not just skills.
            </p>

            {formData.projects.map((proj, index) => (
                <div key={index} className="experience-block">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span className="position-label" style={{ marginBottom: 0 }}>PROJECT {index + 1}</span>
                        {index > 0 && (
                            <button
                                onClick={() => removeProject(index)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}
                            >
                                <Trash2 size={16} /> Remove
                            </button>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Project title</label>
                        <input
                            type="text"
                            value={proj.projectTitle}
                            onChange={(e) => updateProject(index, 'projectTitle', e.target.value)}
                            placeholder="e.g. Payment Processing Platform"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={proj.projectDescription}
                            onChange={(e) => updateProject(index, 'projectDescription', e.target.value)}
                            placeholder="What did you build? What was the outcome?"
                            className="form-input"
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label>Project Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(index, e)}
                            className="form-input"
                            style={{ padding: '9px 16px' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>URL (optional)</label>
                        <input
                            type="url"
                            value={proj.projectUrl}
                            onChange={(e) => updateProject(index, 'projectUrl', e.target.value)}
                            placeholder="https://..."
                            className="form-input"
                        />
                    </div>
                </div>
            ))}

            <button onClick={addProject} className="btn outline-btn">+ Add project</button>

            <div className="step-actions split" style={{ marginTop: '32px' }}>
                <button onClick={prevStep} className="btn secondary-btn">Back</button>
                <button
                    onClick={nextStep}
                    className="btn primary-btn"
                    disabled={!isValid}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}