namespace FindExpertsBackend.DTOs
{
    public class ExpertsProfilesResponseDto
    {
        public Guid ExpertProfileId { get; set; }
        public Guid UserId { get; set; }
        public string FullName { get; set; }
        public string? Location { get; set; }
        public string? ProfilePicture { get; set; }
        public string JobTitle { get; set; }
        public int? FieldId { get; set; }
        public string FieldName { get; set; }
        public string Bio { get; set; }
        public int? TotalExperienceYears { get; set; }
        public bool ConsultationEnabled { get; set; }
        public int NumberOfReviews { get; set; }
        public double Rating { get; set; }
        public int Guarantees { get; set; }
        public decimal? StartingPrice { get; set; }
        public List<string> Skills { get; set; } = new();


    }
}