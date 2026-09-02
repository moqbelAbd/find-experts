using System.ComponentModel.DataAnnotations;

namespace FindExpertsBackend.Models
{
    public class Field
    {
        [Key]
        public int FieldId { get; set; }

        [Required]
        [MaxLength(100)]
        public string FieldName { get; set; }

        public string FieldDescription { get; set; }

        // Navigation Properties
        public virtual ICollection<Skill> Skills { get; set; } = new List<Skill>();
        public virtual ICollection<ExpertProfile> ExpertProfiles { get; set; } = new List<ExpertProfile>();
        public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
    }
}
