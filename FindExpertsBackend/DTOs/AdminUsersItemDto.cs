namespace FindExpertsBackend.DTOs
{
    public class AdminUsersItemDto
    {
        public Guid UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Location { get; set; }
        public string Avatar { get; set; }
        public string Role { get; set; }
        public DateTime JoinedAt { get; set; }
        public string Status { get; set; }
    }
}
