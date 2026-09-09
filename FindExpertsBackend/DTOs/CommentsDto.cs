namespace FindExpertsBackend.DTOs
{
    public class CommentsDto
    {
       public Guid CommentId { get; set; }
        public Guid? ParentCommentId { get; set; }
        public string Content { get; set; }
       public DateTime CreatedAt { get; set; }
       public Guid AuthorId { get; set; }
       public string AuthorName { get; set; }
       public string? AuthorAvatar { get; set; }
    }
}
