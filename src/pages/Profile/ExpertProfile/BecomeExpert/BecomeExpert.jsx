import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import axiosClient from "../../../../api/axiosClient.js";
import './become-expert.css';

import ExpertInfo from './ExpertInfo.jsx';
import ExpertSkills from './ExpertSkills';
import ExpertExperience from './ExpertExperience';
import ExpertCertificates from "./ExpertCertificates.jsx";
import ExpertProjects from "./ExpertProjects.jsx";
import ExpertConsultation from "./ExpertConsultation.jsx";

export default function BecomeExpert() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 6;

    // Master state holding all form data
    const [formData, setFormData] = useState({
        jobTitle: '',
        fieldId: '',
        customField: '',
        bio: '',
        linkedInUrl: '',
        githubUrl: '',
        portfolioUrl: '',
        totalExperienceYears: '',
        skills: [],
        experiences: [{ jobTitle: '', companyName: '', from: '', to: '' }],
        certificates: [{ certificateName: '', issuer: '', issueDate: '' }],
        projects: [{ projectTitle: '', projectDescription: '', projectUrl: '', imageFile: null }],
        consultationEnabled: false,
        availabilities: [{ dayOfWeek: 1, startTime: '', endTime: '' }],
        packages: [{ duration: 30, price: '' }]
    });

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const updateFormData = (newData) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    const submitForm = async () => {
        const toastId = toast.loading('Setting up your expert profile...');

        // Create native FormData object to handle files + data
        const data = new FormData();

        // Append standard fields
        data.append('JobTitle', formData.jobTitle);
        if (formData.fieldId && formData.fieldId !== 'other') {
            data.append('FieldId', formData.fieldId);
        } else if (formData.customField) {
            data.append('CustomField', formData.customField);
        }
        data.append('Bio', formData.bio);
        if (formData.linkedInUrl) data.append('LinkedInUrl', formData.linkedInUrl);
        if (formData.githubUrl) data.append('GithubUrl', formData.githubUrl);
        if (formData.portfolioUrl) data.append('PortfolioUrl', formData.portfolioUrl);
        data.append('TotalExperienceYears', formData.totalExperienceYears);
        data.append('ConsultationEnabled', formData.consultationEnabled);

        // Append Skills array
        formData.skills.forEach((skill, index) => {
            data.append(`Skills[${index}]`, skill);
        });

        // Append Experiences
        const validExperiences = formData.experiences.filter(e => e.jobTitle && e.companyName);
        validExperiences.forEach((exp, index) => {
            data.append(`Experiences[${index}].JobTitle`, exp.jobTitle);
            data.append(`Experiences[${index}].CompanyName`, exp.companyName);
            data.append(`Experiences[${index}].From`, exp.from);
            if (exp.to) data.append(`Experiences[${index}].To`, exp.to);
        });

        // Append Certificates
        const validCertificates = formData.certificates.filter(c => c.certificateName && c.issuer);
        validCertificates.forEach((cert, index) => {
            data.append(`Certificates[${index}].CertificateName`, cert.certificateName);
            data.append(`Certificates[${index}].Issuer`, cert.issuer);
            data.append(`Certificates[${index}].IssueDate`, cert.issueDate);
        });

        // Append Projects (WITH FILES)
        const validProjects = formData.projects.filter(p => p.projectTitle && p.projectDescription);
        validProjects.forEach((proj, index) => {
            data.append(`Projects[${index}].ProjectTitle`, proj.projectTitle);
            data.append(`Projects[${index}].ProjectDescription`, proj.projectDescription);
            if (proj.projectUrl) data.append(`Projects[${index}].ProjectUrl`, proj.projectUrl);
            if (proj.imageFile) data.append(`Projects[${index}].ImageFile`, proj.imageFile); // Attach actual file
        });

        // Append Consultation Setup
        if (formData.consultationEnabled) {
            formData.availabilities.forEach((avail, index) => {
                data.append(`Availabilities[${index}].DayOfWeek`, avail.dayOfWeek);
                data.append(`Availabilities[${index}].StartTime`, avail.startTime);
                data.append(`Availabilities[${index}].EndTime`, avail.endTime);
            });

            formData.packages.forEach((pkg, index) => {
                data.append(`Packages[${index}].Duration`, pkg.duration);
                data.append(`Packages[${index}].Price`, pkg.price);
            });
        }

        try {
            // Send multipart/form-data request
            const response = await axiosClient.post('/ExpertProfile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Expert profile activated!', { id: toastId });

            navigate(`/expert/${response.data.data}`);

        } catch (error) {
            console.error("Error creating expert profile:", error);
            const backendData = error.response?.data;
            const errorMessage = backendData?.message || backendData?.errors?.[0] || 'Failed to setup profile.';
            toast.error(errorMessage, { id: toastId });
        }
    };

    return (
        <div className="container expert-form-container">
            <div className="expert-form-header">
                <h1 className="section-title" style={{ margin: 0 }}>Become an Expert</h1>
                <p className="expert-form-subtitle">Share your expertise and start getting discovered.</p>
            </div>

            {/* Stepper UI */}
            <div className="stepper-wrapper">
                {[1, 2, 3, 4, 5, 6].map((step) => (
                    <React.Fragment key={step}>
                        <div className={`step-circle ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
                            {currentStep > step ? '✓' : step}
                        </div>
                        {step < 6 && <div className={`step-line ${currentStep > step ? 'active' : ''}`}></div>}
                    </React.Fragment>
                ))}
            </div>

            <p className="step-indicator">Step {currentStep} of {totalSteps}</p>

            <div className="expert-form-card">
                {currentStep === 1 && (
                    <ExpertInfo formData={formData} updateFormData={updateFormData} nextStep={nextStep} />
                )}
                {currentStep === 2 && (
                    <ExpertSkills formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />
                )}
                {currentStep === 3 && (
                    <ExpertExperience formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />
                )}
                {currentStep === 4 && (
                    <ExpertCertificates formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />
                )}
                {currentStep === 5 && (
                    <ExpertProjects formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />
                )}
                {currentStep === 6 && (
                    <ExpertConsultation formData={formData} updateFormData={updateFormData} prevStep={prevStep} submitForm={submitForm}/>
                )}
            </div>
        </div>
    );
}