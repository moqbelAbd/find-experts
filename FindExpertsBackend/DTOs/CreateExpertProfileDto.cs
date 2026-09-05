using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace FindExpertsBackend.DTOs
{
    public class CreateExpertProfileDto
    {
        [Required, MaxLength(100)]
        public string JobTitle { get; set; }

        [Required]
        public int FieldId { get; set; }

        public string Bio { get; set; }

        public string? LinkedInUrl { get; set; }
        public string? GithubUrl { get; set; }
        public string? PortfolioUrl { get; set; }

        public int? TotalExperienceYears { get; set; }
        public bool ConsultationEnabled { get; set; }

        // The frontend sends an array of skill names (strings)
        public List<string> Skills { get; set; } = new();

        public List<ExperienceDto> Experiences { get; set; } = new();
        public List<CertificateDto> Certificates { get; set; } = new();
        public List<ProjectDto> Projects { get; set; } = new();
        public List<AvailabilityDto> Availabilities { get; set; } = new();
        public List<PackageDto> Packages { get; set; } = new();
    }

    public class ExperienceDto
    {
        public string JobTitle { get; set; }
        public string CompanyName { get; set; }
        public DateTime From { get; set; }
        public DateTime? To { get; set; }
    }

    public class CertificateDto
    {
        public string CertificateName { get; set; }
        public string Issuer { get; set; }
        public DateTime IssueDate { get; set; }
    }

    public class ProjectDto
    {
        public string ProjectTitle { get; set; }
        public string ProjectDescription { get; set; }
        public string? ProjectUrl { get; set; }
        public IFormFile? ImageFile { get; set; } // Handles the uploaded file
        public string? ExistingImageUrl { get; set; } //Captures the existing image if no new file is uploaded
    }

    public class AvailabilityDto
    {
        public byte DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
    }

    public class PackageDto
    {
        public int Duration { get; set; }
        public decimal Price { get; set; }
    }
}