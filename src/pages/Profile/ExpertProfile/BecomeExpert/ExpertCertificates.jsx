import React from 'react';
import { Trash2 } from 'lucide-react';

export default function ExpertCertificates({ formData, updateFormData, nextStep, prevStep }) {

    const updateCertificate = (index, field, value) => {
        const newCertificates = [...formData.certificates];
        newCertificates[index][field] = value;
        updateFormData({ certificates: newCertificates });
    };

    const addCertificate = () => {
        updateFormData({
            certificates: [...formData.certificates, { certificateName: '', issuer: '', issueDate: '' }]
        });
    };

    const removeCertificate = (indexToRemove) => {
        const newCertificates = formData.certificates.filter((_, index) => index !== indexToRemove);
        updateFormData({ certificates: newCertificates });
    };

    // Allow user to continue if they completely skip the first certificate (since they are optional)
    // BUT if they start filling one out, force them to complete all required fields.
    const isFirstBlockEmpty = formData.certificates.length === 1 &&
        !formData.certificates[0].certificateName &&
        !formData.certificates[0].issuer &&
        !formData.certificates[0].issueDate;

    const isValid = isFirstBlockEmpty || formData.certificates.every(cert =>
        cert.certificateName.trim() && cert.issuer.trim() && cert.issueDate
    );

    return (
        <div className="step-content">
            <h2 className="step-title">Certificates</h2>
            <p className="input-hint" style={{ marginBottom: '24px' }}>
                Add any relevant certificates, degrees, or courses. These add credibility to your profile.
            </p>

            {formData.certificates.map((cert, index) => (
                <div key={index} className="experience-block">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span className="position-label" style={{ marginBottom: 0 }}>CERTIFICATE {index + 1}</span>
                        {index > 0 && (
                            <button
                                onClick={() => removeCertificate(index)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}
                            >
                                <Trash2 size={16} /> Remove
                            </button>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Certificate name</label>
                        <input
                            type="text"
                            value={cert.certificateName}
                            onChange={(e) => updateCertificate(index, 'certificateName', e.target.value)}
                            placeholder="e.g. AWS Solutions Architect"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Issuing organization</label>
                        <input
                            type="text"
                            value={cert.issuer}
                            onChange={(e) => updateCertificate(index, 'issuer', e.target.value)}
                            placeholder="e.g. Amazon Web Services"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Issue Date</label>
                        {/* type="month" allows users to pick just the year and month (e.g., April 2024) */}
                        <input
                            type="month"
                            value={cert.issueDate}
                            onChange={(e) => updateCertificate(index, 'issueDate', e.target.value)}
                            className="form-input"
                        />
                    </div>
                </div>
            ))}

            <button onClick={addCertificate} className="btn outline-btn">+ Add certificate</button>

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