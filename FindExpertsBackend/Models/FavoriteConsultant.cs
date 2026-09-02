using System.ComponentModel.DataAnnotations.Schema;

namespace FindExpertsBackend.Models
{
    public class FavoriteConsultant
    {
        public Guid UserId { get; set; }
        public Guid ExpertId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; }

        [ForeignKey(nameof(ExpertId))]
        public virtual ExpertProfile Expert { get; set; }
    }
}
