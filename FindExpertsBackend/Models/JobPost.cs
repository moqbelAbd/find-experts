using FindExpertsBackend.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FindExpertsBackend.Models
{
    public class JobPost
    {
        [Key]
        public Guid PostId { get; set; }

        [MaxLength(150)]
        public string Company { get; set; }

        [Column(TypeName = "decimal(12,2)")]
        public decimal? ExpectedSalary { get; set; }

        [MaxLength(255)]
        public string JobLocation { get; set; }

        public EmploymentTypeEnum? EmploymentType { get; set; }
        public WorkLocationTypeEnum? WorkLocationType { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(PostId))]
        public virtual Post Post { get; set; }

  
    }
}
