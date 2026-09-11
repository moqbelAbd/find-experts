namespace FindExpertsBackend.DTOs
{
    public class CreateBookingDto
    {
        public Guid ExpertId { get; set; }
        public DateTime BookingStartTime { get; set; }
        public int BookingDuration { get; set; }
        public decimal BookingPrice { get; set; }

    }
}
