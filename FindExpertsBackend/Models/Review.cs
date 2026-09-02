using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FindExpertsBackend.Models
{
    public class Review
    {
        [Key]
        public Guid ReviewId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ReviewerId { get; set; }

        [Required]
        public Guid ExpertId { get; set; }

        [Required]
        public Guid BookingId { get; set; }

        [Required]
        public int Rating { get; set; }

        public string ReviewComment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey(nameof(ReviewerId))]
        public virtual User Reviewer { get; set; }

        [ForeignKey(nameof(ExpertId))]
        public virtual ExpertProfile Expert { get; set; }

        [ForeignKey(nameof(BookingId))]
        public virtual Booking Booking { get; set; }
    }
}
