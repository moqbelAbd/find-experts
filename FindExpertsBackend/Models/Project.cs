using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FindExpertsBackend.Models
{
    public class Project
    {
        [Key]
        public Guid ProjectId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ExpertId { get; set; }

        [Required]
        [MaxLength(200)]
        public string ProjectTitle { get; set; }

        public string ProjectDescription { get; set; }

        [MaxLength(500)]
        public string ProjectImage { get; set; }

        [MaxLength(500)]
        public string ProjectUrl { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(ExpertId))]
        public virtual ExpertProfile Expert { get; set; }
    }
}
