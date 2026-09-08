using Azure;
using FindExpertsBackend.Data;
using FindExpertsBackend.DTOs;
using FindExpertsBackend.Models;
using FindExpertsBackend.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Claims;

namespace FindExpertsBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PostController : ControllerBase
    {
       private readonly ApplicationDbContext _context;

        public PostController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetPosts(
           [FromQuery] Guid? authorId,
           [FromQuery] string? search,
           [FromQuery] int? typeId,
           [FromQuery] int? fieldId,
           [FromQuery] string? sortBy = "newest"
            )
        {

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            User user = null;

            if (Guid.TryParse(userIdStr, out Guid userId))
            {
                user = await _context.Users
                    .Include(u => u.ExpertProfile)
                    .FirstOrDefaultAsync(u => u.Id == userId);
            }


            var query = _context.Posts
                         .AsQueryable();


            // Apply Filters dynamically based on query parameters
            if (!string.IsNullOrWhiteSpace(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(p =>
                    p.PostTitle.ToLower().Contains(lowerSearch) ||
                    p.PostDescription.ToLower().Contains(lowerSearch) ||
                    p.Field.FieldName.ToLower().Contains(lowerSearch) ||
                    p.PostTags.Any(pt => pt.TagName.ToLower().Contains(lowerSearch))  //  .Any() to search inside the collection of tags
                    );
            }

            if (typeId.HasValue)
            {
                query = query.Where(p => (int)p.PostType == typeId.Value);
            }

            if (authorId.HasValue)
            {
                query = query.Where(p => p.AuthorId == authorId);
            }
            else
            {
                query = query.Where(p => p.PostStatus == PostStatusEnum.Open);
                query = query.Where(p => p.Author.UserStatus == UserStatusEnum.Active);
            }

            if (fieldId.HasValue)
            {
                query = query.Where(p => p.FieldId == fieldId.Value);
            }
            else 
            {
                if (user != null && user.ExpertProfile != null)
                    query = query.Where(p => p.FieldId == user.ExpertProfile.FieldId);

            }

            // 3. Apply Sorting
            if (sortBy == "recent_activity")
            {
                query = query.OrderByDescending(p => p.Comments.Any() ? p.Comments.Max(c => c.CreatedAt) : p.CreatedAt);
            }
            else
            {
                // Default: Newest posts first
                query = query.OrderByDescending(p => p.CreatedAt);
            }

            var posts = await query.Select(p => new postsDto
            {
                PostId = p.PostId,
                Type = p.PostType,
                postTitle = p.PostTitle,
                PostContent = p.PostDescription,
                CommentsCount = p.Comments.Count,
                CreatedAt = p.CreatedAt,
                PostStatus = p.PostStatus,

                AuthorId = p.AuthorId,
                AuthorName = p.Author.FullName, 
                AuthorAvatar = p.Author.Avatar, 

                // Service Specific mapping
                Budget = p.ServicePost != null ? p.ServicePost.ServiceBudget : null,

                // Job Specific mapping
                EmploymentType = p.JobPost.EmploymentType?? EmploymentTypeEnum.FullTime,
                Company = p.JobPost != null ? p.JobPost.Company : null,
                WorkLocationType = p.JobPost.WorkLocationType ?? WorkLocationTypeEnum.OnSite,
                JobLocation = p.JobPost != null ? p.JobPost.JobLocation : null,
                ExpectedSalary = p.JobPost != null ? p.JobPost.ExpectedSalary : null,
                PostInterests = p.PostInterests.Count ,

                // Tags mapping
                Tags = p.PostTags.Select(pt => pt.TagName).ToList()
            }).ToListAsync();

            return Ok(ApiResponse <List<postsDto>>.SuccessResult(posts));
    }


        [HttpPost]
        public async Task<IActionResult> CreatePost([FromBody] CreatePostDto dto) {

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if(!Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized(ApiResponse<string>.FailureResult("Invalid user token"));

            var user = await _context.Users.FindAsync(userId);

            if (user == null || user.UserStatus != UserStatusEnum.Active)
            {
                return BadRequest(ApiResponse<string>.FailureResult("Your account is not active or does not exist"));
            }


            using var transaction = await _context.Database.BeginTransactionAsync();


            PostTypeEnum postType;
            if(dto.PostTypeId == 1)
            {
                postType = PostTypeEnum.Question;
            }
            else if (dto.PostTypeId == 2)
            {
                postType = PostTypeEnum.Service;
            }

            else if (dto.PostTypeId == 3)
            {
                postType = PostTypeEnum.Job;
            }
            else
            {
                return BadRequest(ApiResponse<string>.FailureResult("Wrong Post Type"));

            }
            try
            {
                var newPost = new Post
                {
                    AuthorId = userId,
                    CreatedAt = DateTime.UtcNow,
                    PostTitle = dto.PostTitle,
                    PostDescription = dto.PostDescription,
                    PostDeadLine = dto.PostDeadLine?? DateTime.UtcNow.AddDays(30),
                    PostType = postType,
                    FieldId = dto.FieldId,
                    PostStatus = PostStatusEnum.Open

                };

                _context.Posts.Add(newPost);
                await _context.SaveChangesAsync();

                    foreach(var tag in dto.Tags){
                    _context.Add(new PostTag
                    {
                        PostId = newPost.PostId,
                        TagName = tag,
                    });
                    }

                    if(postType == PostTypeEnum.Service)
                   {
                    _context.Add(new ServicePost
                    {
                        PostId = newPost.PostId,
                        ServiceBudget = dto.Budget?? 0
                    });
                }


                else if (postType == PostTypeEnum.Job)
                {

                    WorkLocationTypeEnum workLocation;
                    if (dto.WorkLocationTypeId == 1) workLocation = WorkLocationTypeEnum.OnSite;
                    else if (dto.WorkLocationTypeId == 2) workLocation = WorkLocationTypeEnum.Hybrid;
                    else if (dto.WorkLocationTypeId == 3) workLocation = WorkLocationTypeEnum.Remote;
                    else return BadRequest(ApiResponse<string>.FailureResult("Wrong Job Location Type"));

                    EmploymentTypeEnum employmentType;
                    if (dto.EmploymentTypeId == 1) employmentType = EmploymentTypeEnum.FullTime;
                    else if (dto.EmploymentTypeId == 2) employmentType = EmploymentTypeEnum.PartTime;
                    else if (dto.EmploymentTypeId == 3) employmentType = EmploymentTypeEnum.Contract;
                    else if (dto.EmploymentTypeId == 4) employmentType = EmploymentTypeEnum.Freelance;
                    else return BadRequest(ApiResponse<string>.FailureResult("Wrong Job Type"));

                    _context.Add(new JobPost
                    {
                        PostId = newPost.PostId,
                        Company = dto.Company,
                        ExpectedSalary = dto.ExpectedSalary,
                        JobLocation = dto.JobLocation,
                        WorkLocationType = workLocation,
                        EmploymentType = employmentType

                    });

                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, ApiResponse<string>.FailureResult("An error occurred while saving the profile.", new List<string> { ex.Message }));
            }

            return Ok(ApiResponse<string>.SuccessResult("Creates post successfully"));

        }
    }
}
