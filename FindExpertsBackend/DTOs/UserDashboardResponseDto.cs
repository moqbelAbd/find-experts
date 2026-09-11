using FindExpertsBackend.Models.Enums;

namespace FindExpertsBackend.DTOs
{
    public class UserDashboardResponseDto
    {
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public string UserAvatar { get; set; }
        public Guid? UserExpertProfileId { get; set; }
        public int TotalBookings { get; set; }
        public int PendingBookings { get; set; }
        public int CompletedBookings { get; set; }
        public int UpcomingBookings { get; set; }

        public List<BookingHistoryItem> HistoryItem { get; set; } = new();

    }

    public class BookingHistoryItem
    {
        public Guid BookingId { get; set; }
        public DateTime BookingTime { get; set; }
        public int BookingDuration { get; set; }
        public string BookingStatus { get; set; }
        public decimal BookingPrice { get; set; }
        public string MeetingLink { get; set; }
        public Guid ConsultantId { get; set; }
        public string ConsultantName { get; set; }
        public string ConsultantAvatar { get; set; }
        public string ConsultantJobTitle { get; set; }

    }
}
