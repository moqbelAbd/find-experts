using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FindExpertsBackend.Models
{
    public class ExpertSkill
    {
        public Guid ExpertId { get; set; }
        public int SkillId { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(ExpertId))]
        public virtual ExpertProfile Expert { get; set; }

        [ForeignKey(nameof(SkillId))]
        public virtual Skill Skill { get; set; }
    }
}
