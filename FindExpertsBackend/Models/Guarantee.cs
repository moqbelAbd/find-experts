using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FindExpertsBackend.Models
{
    public class Guarantee
    {
        [Key]
        public Guid GuaranteeId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ClientId { get; set; }

        [Required]
        public Guid ExpertId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey(nameof(ClientId))]
        public virtual User Client { get; set; }

        [ForeignKey(nameof(ExpertId))]
        public virtual ExpertProfile Expert { get; set; }
    }
}
