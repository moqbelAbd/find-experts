using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FindExpertsBackend.Models
{
    public class Experience
    {
        [Key]
        public Guid ExperienceId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ExpertId { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [Required]
        [MaxLength(150)]
        public string JobTitle { get; set; }

        [Required]
        [MaxLength(150)]
        public string CompanyName { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(ExpertId))]
        public virtual ExpertProfile Expert { get; set; }
    }
}
