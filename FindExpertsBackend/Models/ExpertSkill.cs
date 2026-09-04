using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FindExpertsBackend.Models
{
    public class ExpertSkill
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid ExpertId { get; set; }
        public string SkillName { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(ExpertId))]
        public virtual ExpertProfile Expert { get; set; }

  
    }
}
