import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosClient from "../../api/axiosClient.js";
import AvailabilityCalendar from './AvailabilityCalendar';
import BookingSummary from './BookingSummary';
import './booking-page.css';
import ExpertReviews from "./ExpertReviews.jsx";

export default function BookingPage() {
    const { expertId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [expert, setExpert] = useState(null);

    // Form State
    const [selectedDuration, setSelectedDuration] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [bookingNote, setBookingNote] = useState('');

    useEffect(() => {
        const fetchBookingData = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get(`/Book/expert/${expertId}/setup`);
                const expertData = response.data?.data || response.data;
                setExpert(expertData);

                if (expertData.packages && expertData.packages.length > 0) {
                    setSelectedDuration(expertData.packages[0]); // Default to first package
                }

            } catch (error) {
                console.error(error);
                toast.error("Failed to load booking details.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookingData();
    }, [expertId]);

    const handleBookingSubmit = async () => {
        if (!selectedDate || !selectedTime || !selectedDuration) {
            return toast.error("Please select a date and time.");
        }

        const toastId = toast.loading('Requesting consultation...');
        try {

            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');

            // Combine local date and time: "YYYY-MM-DDTHH:mm"
            const bookingDateTime = new Date(`${year}-${month}-${day}T${selectedTime}`);
            const payload = {
                expertId: expert.expertId,
                bookingStartTime: bookingDateTime.toISOString(),
                bookingDuration: selectedDuration.duration,
                bookingPrice: selectedDuration.price
            };

            await axiosClient.post('/Book', payload);

            toast.success('Consultation requested successfully!', { id: toastId });
            setTimeout(() => navigate('/user-dashboard'), 1500); // Redirect after success

        } catch (error) {
            toast.error(error.response?.data?.message || 'Booking failed.', { id: toastId });
        }
    };

    if (loading) return <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>Loading booking details...</div>;
    if (!expert) return <div className="error-state" style={{ textAlign: 'center', padding: '40px' }}>Expert not found.</div>;

    const isGold = expert.guarantees >= 15;
    const isSilver = expert.guarantees >= 10 && expert.guarantees < 15;
    const isBronze = expert.guarantees >= 5 && expert.guarantees < 10;
    const isGreen = expert.guarantees >= 3 && expert.guarantees < 5;
    const badgeClass = isGold ? 'badge-gold' : isSilver ? 'badge-silver'
                              :isBronze? 'badge-bronze' : isGreen? 'badge-green' : '';

    return (
        <div className="booking-page-container">
            <h1 className="page-title">Book a Consultation</h1>

            <div className="booking-layout">
                {/* Left Column: Selections */}
                <div className="booking-main-col">

                    {/* 1. Expert Info Card */}
                    <div className="booking-card expert-overview">
                        <img src={expert.avatar || `https://ui-avatars.com/api/?name=${expert.fullName}`} alt={expert.fullName} className="booking-avatar" />
                        <div className="expert-details">
                            <h2>{expert.fullName}</h2>
                            <p className="job-title">{expert.jobTitle}</p>
                            <div className="expert-meta-row">
                                <span className="rating">
                                    <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
                                    {expert.rating.toFixed(1)} <span className="muted">({expert.reviewsCount})</span>
                                </span>
                                {expert.guarantees >= 3 && (
                                    <span className={`guarantee-pill ${badgeClass}`}>
                                     <span className="dot"></span>
                                        {isGold ? 'Gold Expert'
                                            : isSilver ? 'Silver Expert'
                                                : isBronze ? 'Bronze Expert'
                                                    : 'Green Expert'} - {expert.guarantees} guarantees
                                    </span>
                                 )}
                            </div>
                        </div>
                    </div>

                    {/* 2. Duration Selection */}
                    <div className="booking-card">
                        <h3>Session duration</h3>
                        <div className="duration-options">
                            {expert.packages && expert.packages.length > 0 ? (
                                expert.packages.map((pkg, idx) => (
                                    <button
                                        key={idx}
                                        className={`duration-btn ${selectedDuration?.duration === pkg.duration ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedDuration(pkg);
                                            setSelectedTime(null); // Reset time if duration changes
                                        }}
                                    >
                                        {pkg.duration} min : ${pkg.price}
                                    </button>
                                ))
                            ) : (
                                <p className="muted">No packages available for this expert.</p>
                            )}
                        </div>
                    </div>

                    {/* 3. Availability Calendar */}
                    <div className="booking-card">
                        <h3>Select a date & time</h3>
                        <AvailabilityCalendar
                            schedule={expert.schedule}
                            bookedSlots={expert.bookedSlots || []}
                            duration={selectedDuration?.duration }
                            selectedDate={selectedDate}
                            onSelectDate={(date) => {
                                setSelectedDate(date);
                                setSelectedTime(null);
                            }}
                            selectedTime={selectedTime}
                            onSelectTime={setSelectedTime}
                        />
                    </div>

                    <ExpertReviews reviews={expert.reviews} />

                </div>

                {/* Right Column: Sticky Summary */}
                <div className="booking-side-col">
                    <BookingSummary
                        expertName={expert.fullName}
                        date={selectedDate}
                        time={selectedTime}
                        duration={selectedDuration?.duration}
                        price={selectedDuration?.price}
                        onSubmit={handleBookingSubmit}
                    />
                </div>
            </div>
        </div>
    );
}