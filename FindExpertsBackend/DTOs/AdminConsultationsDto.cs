using FindExpertsBackend.Models.Enums;

namespace FindExpertsBackend.DTOs
{
    public class AdminConsultationsDto
    {
        public int TotalBookings { get; set; }
        public int Completed { get; set; }
        public int Pending { get; set; }
        public int Accepted { get; set; }
        public int Cancelled { get; set; }
        public int Rejected { get; set; }
        public List<AdminBookingItemDto> Bookings { get; set; } = new();
    }

    public class AdminBookingItemDto
    {
        public Guid BookingId { get; set; }
        public string ClientName { get; set; }
        public Guid ClientId { get; set; }
        public string ExpertName { get; set; }
        public Guid ExpertId { get; set; }
        public DateTime BookingTime { get; set; }
        public int BookingDuration { get; set; }
        public decimal BookingPrice { get; set; }
        public BookingStatusEnum BookingStatus { get; set; }
    }

}
