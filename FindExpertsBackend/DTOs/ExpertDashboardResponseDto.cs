using FindExpertsBackend.Models.Enums;

namespace FindExpertsBackend.DTOs
{
    public class ExpertDashboardResponseDto
    {
        public Guid ExpertId { get; set; }
        public string ExpertName { get; set; }
        public string ExpertAvatar { get; set; }
        public int GuaranteesCount { get; set; }
        public double AverageRating { get; set; }
        public int TotalConsultations { get; set; }
        public decimal BasePrice { get; set; }

        public List<ExpertBookingItemDto> PendingRequests { get; set; } = new();
        public List<ExpertBookingItemDto> UpcomingConsultations { get; set; } = new();
        public List<ExpertBookingItemDto> History { get; set; } = new();
    }

    public class ExpertBookingItemDto
    {
        public Guid BookingId { get; set; }
        public Guid ClientId { get; set; }
        public string ClientName { get; set; }
        public string ClientAvatar { get; set; }
        public DateTime BookingTime { get; set; }
        public int BookingDuration { get; set; }
        public decimal BookingPrice { get; set; }
        public BookingStatusEnum BookingStatus { get; set; }
        public string MeetingLink { get; set; }
    }
}
