import React from 'react';
import { Trash2 } from 'lucide-react';
import "./expert-expierence.css"

export default function ExpertExperience({ formData, updateFormData, nextStep, prevStep }) {

    const updateExperience = (index, field, value) => {
        const newExperiences = [...formData.experiences];
        newExperiences[index][field] = value;
        updateFormData({ experiences: newExperiences });
    };

    const addPosition = () => {
        updateFormData({
            experiences: [...formData.experiences, { jobTitle: '', companyName: '', from: '', to: '' }]
        });
    };

    const removeExperience = (indexToRemove) => {
        const newExperiences = formData.experiences.filter((_, index) => index !== indexToRemove);
        updateFormData({ experiences: newExperiences });
    };

    const isFirstBlockEmpty = formData.experiences.length === 1 &&
        !formData.experiences[0].jobTitle &&
        !formData.experiences[0].companyName &&
        !formData.experiences[0].from;

    const isValid = isFirstBlockEmpty || formData.experiences.every(exp =>
        exp.jobTitle.trim() && exp.companyName.trim() && exp.from
    );

    return (
        <div className="step-content">
            <h2 className="step-title">Experience</h2>

            {formData.experiences.map((exp, index) => (
                <div key={index} className="experience-block">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span className="position-label" style={{ marginBottom: 0 }}>POSITION {index + 1}</span>
                        {index > 0 && (
                            <button
                                onClick={() => removeExperience(index)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}
                            >
                                <Trash2 size={16} /> Remove
                            </button>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Role</label>
                        <input type="text" value={exp.jobTitle} onChange={(e) => updateExperience(index, 'jobTitle', e.target.value)} placeholder="e.g. Senior Software Engineer" className="form-input" />
                    </div>

                    <div className="form-group">
                        <label>Company</label>
                        <input type="text" value={exp.companyName} onChange={(e) => updateExperience(index, 'companyName', e.target.value)} placeholder="e.g. Google" className="form-input" />
                    </div>

                    <div className="date-group">
                        <div className="form-group flex-1">
                            <label>From</label>
                            <input type="date" value={exp.from} onChange={(e) => updateExperience(index, 'from', e.target.value)} className="form-input" />
                        </div>
                        <div className="form-group flex-1">
                            <label>To</label>
                            <input type="date" value={exp.to} onChange={(e) => updateExperience(index, 'to', e.target.value)} className="form-input" />
                        </div>
                    </div>
                </div>
            ))}

            <button onClick={addPosition} className="btn outline-btn">+ Add another position</button>

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