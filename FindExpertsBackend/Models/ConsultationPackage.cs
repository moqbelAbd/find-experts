using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FindExpertsBackend.Models
{
    public class ConsultationPackage
    {
        [Key]
        public Guid ConsultationPackageId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ExpertId { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }

        [Required]
        public int Duration { get; set; }

 

        // Navigation Properties
        [ForeignKey(nameof(ExpertId))]
        public virtual ExpertProfile Expert { get; set; }

    }
}
