namespace FindExpertsBackend.DTOs
{
    public class ExpertProfileResponseDto
    {
        public Guid ExpertProfileId { get; set; }
        public Guid UserId { get; set; }
        public string FullName { get; set; }
        public string? ProfilePicture { get; set; }
        public string JobTitle { get; set; }
        public int FieldId { get; set; }
        public string FieldName { get; set; }
        public string Bio { get; set; }
        public int? TotalExperienceYears { get; set; }
        public bool ConsultationEnabled { get; set; }

        public string? LinkedInUrl { get; set; }
        public string? GithubUrl { get; set; }
        public string? PortfolioUrl { get; set; }

        public List<string> Skills { get; set; } = new();
        public List<ExperienceResponseDto> Experiences { get; set; } = new();
        public List<CertificateResponseDto> Certificates { get; set; } = new();
        public List<ProjectResponseDto> Projects { get; set; } = new();
        public List<AvailabilityResponseDto> Availabilities { get; set; } = new();
        public List<PackageResponseDto> Packages { get; set; } = new();
    }

    public class ExperienceResponseDto
    {
        public string JobTitle { get; set; }
        public string CompanyName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class CertificateResponseDto
    {
        public string CertificateName { get; set; }
        public string Issuer { get; set; }
        public DateTime IssueDate { get; set; }
    }

    public class ProjectResponseDto
    {
        public string ProjectTitle { get; set; }
        public string ProjectDescription { get; set; }
        public string? ProjectUrl { get; set; }
        public string? ProjectImage { get; set; } // Returns the URL
    }

    public class AvailabilityResponseDto
    {
        public byte DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
    }

    public class PackageResponseDto
    {
        public int Duration { get; set; }
        public decimal Price { get; set; }
    }
}