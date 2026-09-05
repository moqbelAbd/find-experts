
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FindExpertsBackend.Models
{
    public class ExpertProfile
    {
        [Key]
        public Guid ExpertProfileId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        [MaxLength(150)]
        public string JobTitle { get; set; }

        public int? FieldId { get; set; }

        [MaxLength(100)]
        public string FieldName { get; set; }
        public string Bio { get; set; }

        [MaxLength(500)]
        public string? LinkedInUrl { get; set; }

        [MaxLength(500)]
        public string? GithubUrl { get; set; }

        [MaxLength(500)]
        public string? PortfolioUrl { get; set; }

        public int? TotalExperienceYears { get; set; }
        public bool ConsultationEnabled { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; }

        [ForeignKey(nameof(FieldId))]
        public virtual Field? Field { get; set; }

        public virtual ICollection<ConsultationPackage> ConsultationPackages { get; set; } = new List <ConsultationPackage> ();
        public virtual ICollection<ExpertSkill> ExpertSkills { get; set; } = new List<ExpertSkill>();
        public virtual ICollection<Experience> Experiences { get; set; } = new List<Experience>();
        public virtual ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
        public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
        public virtual ICollection<ServiceInterest> ServiceInterests { get; set; } = new List<ServiceInterest>();
        public virtual ICollection<JobInterest> JobInterests { get; set; } = new List<JobInterest>();
        public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public virtual ICollection<ExpertAvailability> ExpertAvailabilities { get; set; } = new List<ExpertAvailability>();

        [InverseProperty(nameof(Review.Expert))]
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

        [InverseProperty(nameof(Guarantee.Expert))]
        public virtual ICollection<Guarantee> Guarantees { get; set; } = new List<Guarantee>();

        public virtual ICollection<FavoriteConsultant> FavoritedBy { get; set; } = new List<FavoriteConsultant>();
    }
}
