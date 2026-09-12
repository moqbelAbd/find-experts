namespace FindExpertsBackend.DTOs
{
    public class ChatsDto
    {
        public Guid PartnerId { get; set; }
        public string PartnerName { get; set; }
        public string PartnerAvatar { get; set; }
        public string LastMessage { get; set; }
        public DateTime LastMessageDate { get; set; }
        public int UnreadCount { get; set; }
    }
}
