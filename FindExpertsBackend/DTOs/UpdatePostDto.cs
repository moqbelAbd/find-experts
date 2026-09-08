using FindExpertsBackend.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace FindExpertsBackend.DTOs
{
    public class UpdatePostDto
    {
        [Required]
        public Guid PostId { get; set; }
        public DateTime? PostDeadLine { get; set; }

        [MaxLength(255)]
        public string PostTitle { get; set; }

        [Required]
        public string PostDescription { get; set; }

        [Required]
        public int FieldId { get; set; }

        public List<string> Tags { get; set; }

        public int? Budget { get; set; }

        public string? Company { get; set; }
        [MaxLength(255)]
        public string? JobLocation { get; set; }
        public int? ExpectedSalary { get; set; }

        public int? EmploymentTypeId { get; set; }
        public int? WorkLocationTypeId { get; set; }



    }
}
