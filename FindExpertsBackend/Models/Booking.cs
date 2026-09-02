using FindExpertsBackend.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FindExpertsBackend.Models
{
    public class Booking
    {
        [Key]
        public Guid BookingId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid ExpertId { get; set; }

        [Required]
        public DateTime BookingStartTime { get; set; }

        [Required]
        public int BookingDuration { get; set; }

        [Required]
        [Column(TypeName = "decimal(7,2)")]
        public decimal BookingPrice { get; set; }

        [Required]
        public virtual BookingStatusEnum BookingStatus { get; set; } = BookingStatusEnum.Pending;

        [MaxLength(500)]
        public string MeetingUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; }

        [ForeignKey(nameof(ExpertId))]
        public virtual ExpertProfile Expert { get; set; }

        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}
