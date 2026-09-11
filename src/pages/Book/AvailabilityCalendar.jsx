import React, { useMemo } from 'react';
import "./availability-calendar.css"

export default function AvailabilityCalendar({
                                                 schedule,
                                                 bookedSlots,
                                                 duration,
                                                 selectedDate,
                                                 onSelectDate,
                                                 selectedTime,
                                                 onSelectTime
                                             }) {

    // Generate next 14 days
    const next14Days = useMemo(() => {
        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 28; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            days.push(d);
        }
        return days;
    }, []);

    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    // Core Logic: Generate available time slots for a specific date
    const getAvailableTimeSlots = (date) => {
        if (!date || !schedule) return [];

        const dayOfWeek = date.getDay();

        // Find expert's working hours for this day of the week
        const daySchedule = schedule.find(s => s.dayOfWeek === dayOfWeek);
        if (!daySchedule) return []; // Doesn't work this day

        const slots = [];
        const [startHour, startMin] = daySchedule.startTime.split(':').map(Number);
        const [endHour, endMin] = daySchedule.endTime.split(':').map(Number);

        let currentTime = new Date(date);
        currentTime.setHours(startHour, startMin, 0, 0);

        const endTime = new Date(date);
        endTime.setHours(endHour, endMin, 0, 0);

        // Generate slots based on duration
        while (currentTime.getTime() + (duration * 60000) <= endTime.getTime()) {
            const timeString = currentTime.toTimeString().substring(0, 5);
            const slotEndMs = currentTime.getTime() + (duration * 60000);

            // Check against existing bookings
            const isBooked = bookedSlots.some(booking => {
                // Force JavaScript to read the backend date as UTC by appending 'Z'
                const safeStartString = booking.start.endsWith('Z') ? booking.start : `${booking.start}Z`;
                const bookingStartMs = new Date(safeStartString).getTime();
                const bookingEndMs = bookingStartMs + (booking.duration * 60000);

                // Overlap condition: Does the current generated slot overlap with the booked slot?
                return (currentTime.getTime() < bookingEndMs) && (slotEndMs > bookingStartMs);
            });

            if (!isBooked) {
                slots.push(timeString);
            }

            // Increment by duration to check the next slot
            currentTime = new Date(currentTime.getTime() + (duration * 60000));
        }

        return slots;
    };

    // Helper to check if a day should be clickable at all
    const hasAvailability = (date) => {
        return getAvailableTimeSlots(date).length > 0;
    };

    const isSameDate = (d1, d2) => {
        return d1 && d2 && d1.toDateString() === d2.toDateString();
    };

    const availableSlotsForSelected = useMemo(() => getAvailableTimeSlots(selectedDate), [selectedDate, duration, schedule, bookedSlots]);

    return (
        <div className="calendar-wrapper">
            {/* 14-Day Grid */}
            <div className="days-grid">
                {next14Days.map((date, i) => {
                    const isAvailable = hasAvailability(date);
                    const isSelected = isSameDate(date, selectedDate);

                    return (
                        <button
                            key={i}
                            disabled={!isAvailable}
                            className={`day-card ${isSelected ? 'selected' : ''} ${!isAvailable ? 'muted' : ''}`}
                            onClick={() => {
                                if (isAvailable) onSelectDate(date);
                            }}
                        >
                            <span className="day-name">{dayNames[date.getDay()]}</span>
                            <span className="day-number">{date.getDate()}</span>
                        </button>
                    );
                })}
            </div>

            {/* Time Slots Picker (Appears when a date is selected) */}
            {selectedDate && (
                <div className="time-slots-section">
                    <h4>Available Times for {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</h4>
                    <div className="time-slots-grid">
                        {availableSlotsForSelected.length > 0 ? (
                            availableSlotsForSelected.map((time, idx) => (
                                <button
                                    key={idx}
                                    className={`time-slot-btn ${selectedTime === time ? 'selected' : ''}`}
                                    onClick={() => onSelectTime(time)}
                                >
                                    {time}
                                </button>
                            ))
                        ) : (
                            <p className="muted-text">No time slots left on this date.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}