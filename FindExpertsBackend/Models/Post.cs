using FindExpertsBackend.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Net;

namespace FindExpertsBackend.Models
{
    public class Post
    {
        [Key]
        public Guid PostId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid AuthorId { get; set; }

        [Required]
        public PostTypeEnum PostType{ get; set; }

        [Required]
        public PostStatusEnum PostStatus { get; set; } = PostStatusEnum.Open;

        public DateTime PostDeadLine {  get; set; }

        [Required]
        [MaxLength(255)]
        public string PostTitle { get; set; }

        public string PostDescription { get; set; }

        [Required]
        public int FieldId { get; set; }


        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey(nameof(AuthorId))]
        public virtual User Author { get; set; }


        [ForeignKey(nameof(FieldId))]
        public virtual Field Field { get; set; }

        public virtual ServicePost ServicePost { get; set; }
        public virtual JobPost JobPost { get; set; }

        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public virtual ICollection<ServiceInterest> ServiceInterests { get; set; } = new List<ServiceInterest>();
        public virtual ICollection<JobInterest> JobInterests { get; set; } = new List<JobInterest>();
    }
}
