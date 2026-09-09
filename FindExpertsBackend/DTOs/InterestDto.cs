namespace FindExpertsBackend.DTOs
{
    public class InterestDto
    {
        public Guid ExpertId { get; set; }
        public Guid UserId { get; set; }
        public string FullName { get; set; }
        public string Avatar { get; set; }
        public DateTime AppliedAt { get; set; }
    }
}
