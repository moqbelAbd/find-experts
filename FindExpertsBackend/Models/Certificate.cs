using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FindExpertsBackend.Models
{
    public class Certificate
    {
        [Key]
        public Guid CertificateId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ExpertId { get; set; }

        [Required]
        [MaxLength(200)]
        public string CertificateName { get; set; }

        [Required]
        [MaxLength(150)]
        public string Issuer { get; set; }

        [Required]
        public DateTime IssueDate { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(ExpertId))]
        public virtual ExpertProfile Expert { get; set; }
    }
}
