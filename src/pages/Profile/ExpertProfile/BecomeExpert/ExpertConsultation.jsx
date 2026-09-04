import React from 'react';
import { Trash2 } from 'lucide-react';
import "./expert-consultation.css"

export default function ExpertConsultation({ formData, updateFormData, prevStep, submitForm }) {

    // -- Toggle Handler --
    const handleToggle = () => {
        updateFormData({ consultationEnabled: !formData.consultationEnabled });
    };

    // -- Availability Handlers --
    const updateAvailability = (index, field, value) => {
        const newAvail = [...formData.availabilities];
        newAvail[index][field] = value;
        updateFormData({ availabilities: newAvail });
    };

    const addAvailability = () => {
        updateFormData({
            availabilities: [...formData.availabilities, { dayOfWeek: 1, startTime: '', endTime: '' }]
        });
    };

    const removeAvailability = (indexToRemove) => {
        const newAvail = formData.availabilities.filter((_, index) => index !== indexToRemove);
        updateFormData({ availabilities: newAvail });
    };

    // -- Package Handlers --
    const updatePackage = (index, field, value) => {
        const newPkgs = [...formData.packages];
        newPkgs[index][field] = value;
        updateFormData({ packages: newPkgs });
    };

    const addPackage = () => {
        updateFormData({
            packages: [...formData.packages, { duration: 30, price: '' }]
        });
    };

    const removePackage = (indexToRemove) => {
        const newPkgs = formData.packages.filter((_, index) => index !== indexToRemove);
        updateFormData({ packages: newPkgs });
    };

    // -- Validation --
    // If OFF, form is valid. If ON, ensure at least one fully filled availability and package.
    const isAvailValid = formData.availabilities.every(a => a.startTime && a.endTime);
    const isPackagesValid = formData.packages.every(p => p.duration > 0 && p.price !== '');
    const isValid = !formData.consultationEnabled || (isAvailValid && isPackagesValid);

    const daysOfWeek = [
        { value: 0, label: 'Sunday' },
        { value: 1, label: 'Monday' },
        { value: 2, label: 'Tuesday' },
        { value: 3, label: 'Wednesday' },
        { value: 4, label: 'Thursday' },
        { value: 5, label: 'Friday' },
        { value: 6, label: 'Saturday' }
    ];

    return (
        <div className="step-content">
            <h2 className="step-title">Consultation Setup</h2>

            {/* The Toggle Switch */}
            <div className="experience-block toggle-block">
                <label className="toggle-switch">
                    <input
                        type="checkbox"
                        checked={formData.consultationEnabled}
                        onChange={handleToggle}
                    />
                    <span className="slider round"></span>
                </label>
                <div className="toggle-text">
                    <h4>Offer Consultations</h4>
                    <p>Let clients book paid one-on-one sessions with you</p>
                </div>
            </div>

            {/* Revealed Settings if Toggled ON */}
            {formData.consultationEnabled && (
                <div className="consultation-settings fade-in">

                    {/* Weekly Availability */}
                    <h3 className="sub-section-title">Weekly Availability</h3>
                    {formData.availabilities.map((avail, index) => (
                        <div key={index} className="settings-row">
                            <div className="form-group flex-1">
                                <label>Day</label>
                                <select
                                    value={avail.dayOfWeek}
                                    onChange={(e) => updateAvailability(index, 'dayOfWeek', parseInt(e.target.value))}
                                    className="form-input"
                                >
                                    {daysOfWeek.map(day => (
                                        <option key={day.value} value={day.value}>{day.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group flex-1">
                                <label>Start Time</label>
                                <input
                                    type="time"
                                    value={avail.startTime}
                                    onChange={(e) => updateAvailability(index, 'startTime', e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group flex-1">
                                <label>End Time</label>
                                <input
                                    type="time"
                                    value={avail.endTime}
                                    onChange={(e) => updateAvailability(index, 'endTime', e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            {index > 0 && (
                                <button onClick={() => removeAvailability(index)} className="icon-remove-btn">
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button onClick={addAvailability} className="btn outline-btn btn-sm">+ Add Day</button>

                    <hr className="section-divider" />

                    {/* Pricing Packages */}
                    <h3 className="sub-section-title">Pricing Packages</h3>
                    {formData.packages.map((pkg, index) => (
                        <div key={index} className="settings-row">
                            <div className="form-group flex-1">
                                <label>Duration (Minutes)</label>
                                <select
                                    value={pkg.duration}
                                    onChange={(e) => updatePackage(index, 'duration', parseInt(e.target.value))}
                                    className="form-input"
                                >
                                    <option value={15}>15 Minutes</option>
                                    <option value={30}>30 Minutes</option>
                                    <option value={45}>45 Minutes</option>
                                    <option value={60}>60 Minutes</option>
                                </select>
                            </div>
                            <div className="form-group flex-1">
                                <label>Price (USD)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={pkg.price}
                                    onChange={(e) => updatePackage(index, 'price', e.target.value)}
                                    placeholder="e.g. 50.00"
                                    className="form-input"
                                />
                            </div>
                            {index > 0 && (
                                <button onClick={() => removePackage(index)} className="icon-remove-btn">
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button onClick={addPackage} className="btn outline-btn btn-sm">+ Add Package</button>

                </div>
            )}

            <div className="step-actions split" style={{ marginTop: '40px' }}>
                <button onClick={prevStep} className="btn secondary-btn">Back</button>
                <button
                    onClick={submitForm}
                    className="btn primary-btn"
                    disabled={!isValid}
                >
                    Finish Setup
                </button>
            </div>
        </div>
    );
}