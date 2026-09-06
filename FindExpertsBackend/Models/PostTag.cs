using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FindExpertsBackend.Models
{
    public class PostTag
    {
        [Key]
        public Guid PostTagId { get; set; } = Guid.NewGuid();


        [Required]
        [MaxLength(50)]
        public string TagName { get; set; }
        
        [Required]
        public Guid PostId { get; set; }

        [ForeignKey(nameof(PostId))]
        public virtual Post Post { get; set; }

        public int? SkillId { get; set; }

        [ForeignKey(nameof(SkillId))]
        public virtual Skill Skill { get; set; }
    }
}