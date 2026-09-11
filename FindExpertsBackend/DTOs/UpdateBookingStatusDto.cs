using FindExpertsBackend.Models.Enums;

namespace FindExpertsBackend.DTOs
{
    public class UpdateBookingStatusDto
    {
        public BookingStatusEnum NewStatus { get; set; }
        public string? MeetingLink { get; set; }
    }
}
