using FindExpertsBackend.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace FindExpertsBackend.DTOs
{
    public class CreatePostDto
    {
        [Required]
        public int PostTypeId { get; set; }
        public DateTime? PostDeadLine { get; set; }

        [MaxLength(255)]
        public string PostTitle { get; set; }

        [Required]
        public string PostDescription { get; set; }
        public IFormFile? AttachedPhoto { get; set; }
        public int? FieldId { get; set; }

        public bool RestrictToFieldExperts { get; set; } = false;

        public List<string>? Tags { get; set; }

        public int? Budget { get; set; }

        public string? Company { get; set; }
        [MaxLength(255)]
        public string? JobLocation { get; set; }
        public int? ExpectedSalary { get; set; }

        public int? EmploymentTypeId { get; set; }
        public int? WorkLocationTypeId { get; set; }



    }
}
