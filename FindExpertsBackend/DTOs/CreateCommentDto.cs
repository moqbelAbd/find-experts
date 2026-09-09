using System.ComponentModel.DataAnnotations;

namespace FindExpertsBackend.DTOs
{
    public class CreateCommentDto
    {
        [Required]
        public Guid PostId { get; set; }
        public Guid? ParentCommentId { get; set; }
        public string Content { get; set; }

    }
    public class EditCommentDto
    {
        public string Content { get; set; }
    }
}
