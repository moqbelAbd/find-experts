using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FindExpertsBackend.Models
{
    public class Skill
    {
        [Key]
        public int SkillId { get; set; }

        [Required]
        [MaxLength(100)]
        public string SkillName { get; set; }

        public int? FieldId { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(FieldId))]
        public virtual Field Field { get; set; }

    }
}
