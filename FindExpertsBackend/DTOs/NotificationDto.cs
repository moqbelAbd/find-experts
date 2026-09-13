namespace FindExpertsBackend.DTOs
{
    public class NotificationDto
    {
        public Guid NotificationId { get; set; }
        public int Type { get; set; } // Returns the enum as an int (1-5)
        public string NotificationTitle { get; set; }
        public string NotificationText { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
