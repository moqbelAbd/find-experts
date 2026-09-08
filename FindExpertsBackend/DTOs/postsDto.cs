using FindExpertsBackend.Models.Enums;
using System.Data;

namespace FindExpertsBackend.DTOs
{
    public class postsDto
    {
        public Guid PostId { get; set; }
        public PostTypeEnum Type { get; set; }
        public string postTitle { get; set; }
        public string PostContent { get; set; }
        public int CommentsCount { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public PostStatusEnum PostStatus { get; set; }
        public Guid AuthorId { get; set; }
        public string AuthorName { get; set; }
        public string? AuthorAvatar { get; set; }

        public int? Budget { get; set; }


        public EmploymentTypeEnum EmploymentType { get; set; }
        public string? Company { get; set; }
        public WorkLocationTypeEnum WorkLocationType { get; set; }
        public string? JobLocation { get; set; }
        public decimal? ExpectedSalary { get; set; }

        public int? PostInterests { get; set; }

        public List<string> Tags { get; set; } 


    }
}
