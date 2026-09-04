import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import axiosClient from "../../../../api/axiosClient.js";
import toast from 'react-hot-toast';
import "./expert-skills.css"

export default function ExpertSkills({ formData, updateFormData, nextStep, prevStep }) {
    const [skillInput, setSkillInput] = useState('');
    const [suggestedSkills, setSuggestedSkills] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Only fetch if they selected a field in step 1

        if (formData.fieldId) {
            const fetchSkills = async () => {
                setIsLoading(true);
                try {
                    const response = await axiosClient.get(`/Skill/by-field/${formData.fieldId}`);
                    setSuggestedSkills(response.data.data || []);
                } catch (error) {
                    console.error("Error fetching skills:", error);
                    // Silent fail is okay here, they can just type skills manually
                } finally {
                    setIsLoading(false);
                }
            };
            fetchSkills();
        }
    }, [formData.fieldId]);

    // Handles typing a custom skill and pressing Add/Enter
    const handleAddManualSkill = (e) => {
        e.preventDefault();
        const newSkill = skillInput.trim();

        // Prevent empty strings or duplicates (case-insensitive check)
        if (newSkill && !formData.skills.some(s => s.toLowerCase() === newSkill.toLowerCase())) {
            updateFormData({ skills: [...formData.skills, newSkill] });
            setSkillInput('');
        }
    };

    // Handles clicking a suggested skill
    const handleAddSuggestedSkill = (skillName) => {
        if (!formData.skills.some(s => s.toLowerCase() === skillName.toLowerCase())) {
            updateFormData({ skills: [...formData.skills, skillName] });
        }
    };

    const removeSkill = (skillToRemove) => {
        updateFormData({ skills: formData.skills.filter(s => s !== skillToRemove) });
    };

    // Filter out suggested skills that the user has already selected
    const availableSuggestions = suggestedSkills.filter(
        suggested => !formData.skills.some(selected => selected.toLowerCase() === suggested.skillName.toLowerCase())
    );

    return (
        <div className="step-content">
            <h2 className="step-title">Skills</h2>

            <div className="form-group">
                <label>Add skills manually</label>
                <div className="skill-input-wrapper">
                    <form onSubmit={handleAddManualSkill} style={{ display: 'flex', gap: '12px', width: '100%' }}>
                        <input
                            type="text"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            placeholder="e.g. Python, React, SQL..."
                            className="form-input"
                        />
                        <button type="submit" className="btn skill-add-btn">Add</button>
                    </form>
                </div>
                <span className="input-hint">Press Enter or click Add after each skill.</span>
            </div>

            {/* Suggested Skills Section */}
            {isLoading && <p className="input-hint">Loading suggestions...</p>}
            {availableSuggestions.length > 0 && (
                <div className="form-group" style={{ marginTop: '24px' }}>
                    <label>Suggested based on your field</label>
                    <div className="skills-container suggestions">
                        {availableSuggestions.map((skill) => (
                            <button
                                key={skill.SkillId}
                                onClick={() => handleAddSuggestedSkill(skill.skillName)}
                                className="skill-chip suggestion"
                            >
                                <Plus size={14} /> {skill.skillName}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Selected Skills Section */}
            <div className="form-group" style={{ marginTop: '32px' }}>
                <label>Your selected skills</label>
                {formData.skills.length === 0 ? (
                    <p className="input-hint">No skills added yet.</p>
                ) : (
                    <div className="skills-container">
                        {formData.skills.map((skill, index) => (
                            <div key={index} className="skill-chip selected">
                                {skill}
                                <button onClick={() => removeSkill(skill)} className="skill-remove">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="step-actions split">
                <button onClick={prevStep} className="btn secondary-btn">Back</button>
                <button
                    onClick={nextStep}
                    className="btn primary-btn"
                    disabled={formData.skills.length === 0}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}