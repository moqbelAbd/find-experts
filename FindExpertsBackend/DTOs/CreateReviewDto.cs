using System.ComponentModel.DataAnnotations;

namespace FindExpertsBackend.DTOs
{
    public class CreateReviewDto
    {
        [Required]
        public Guid ExpertId { get; set; }

        [Required]
        public Guid BookingId { get; set; }

        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5 stars.")]
        public int Rating { get; set; }

        public string? ReviewComment { get; set; }

        public bool IsGuaranteed { get; set; } = false;
    }
}
