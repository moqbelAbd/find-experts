using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FindExpertsBackend.Models
{
    public class ExpertAvailability
    {
        [Key]
        public Guid ExpertAvailabilityId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ExpertId { get; set; }

        [Required]
        public byte DayOfWeek { get; set; } // Matches tinyint

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        public bool IsAvailable { get; set; } = true;

        // Navigation Properties
        [ForeignKey(nameof(ExpertId))]
        public virtual ExpertProfile Expert { get; set; }
    }
}
