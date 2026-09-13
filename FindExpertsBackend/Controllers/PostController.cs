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
using System.Linq.Expressions;
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
            int? userFieldId = null;
            if (user != null)
            {
                userFieldId = user.ExpertProfile?.FieldId;
            
            }
           var query = _context.Posts
                        .Where(p => p.RestrictToFieldExperts == false || p.AuthorId == userId ||
                        (p.RestrictToFieldExperts == false &&  userFieldId != null && p.FieldId == userFieldId) )
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
                query = query.Where(p => p.PostStatus != PostStatusEnum.Deleted );
            }
            else
            {
                query = query.Where(p => p.PostDeadLine >= DateTime.UtcNow);
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
                AttachedPhoto = p.AttachedPhotoUrl,
                PostContent = p.PostDescription,
                CommentsCount = p.Comments.Count,
                postDeadLine =p.PostDeadLine,
                CreatedAt = p.CreatedAt,
                PostStatus = p.PostStatus,
                FieldId = p.FieldId,

                AuthorId = p.AuthorId,
                AuthorName = p.Author.FullName, 
                AuthorAvatar = p.Author.Avatar,

                // Service Specific mapping
                Budget = p.ServicePost != null ? p.ServicePost.ServiceBudget : null,

                // Job Specific mapping
                EmploymentType = p.JobPost != null ? p.JobPost.EmploymentType?? EmploymentTypeEnum.FullTime : EmploymentTypeEnum.FullTime,
                Company = p.JobPost != null ? p.JobPost.Company : null,
                WorkLocationType = p.JobPost != null ? p.JobPost.WorkLocationType ?? WorkLocationTypeEnum.OnSite : WorkLocationTypeEnum.OnSite,
                JobLocation = p.JobPost != null ? p.JobPost.JobLocation : null,
                ExpectedSalary = p.JobPost != null ? p.JobPost.ExpectedSalary : null,
                PostInterests = p.PostInterests.Count ,

                // Tags mapping
                Tags = p.PostTags.Select(pt => pt.TagName).ToList()
            }).ToListAsync();

            return Ok(ApiResponse <List<postsDto>>.SuccessResult(posts));
    }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPostById(Guid id)
        {
            var post = await _context.Posts
                .Where(p => p.PostId == id)
                .Select(p => new postsDto 
                {
                    PostId = p.PostId,
                    Type = p.PostType,
                    postTitle = p.PostTitle,
                    AttachedPhoto = p.AttachedPhotoUrl,
                    PostContent = p.PostDescription,
                    CommentsCount = p.Comments.Count,
                    postDeadLine = p.PostDeadLine,
                    CreatedAt = p.CreatedAt,
                    PostStatus = p.PostStatus,
                    FieldId = p.FieldId,
                    AuthorId = p.AuthorId,
                    AuthorName = p.Author.FullName,
                    AuthorAvatar = p.Author.Avatar,
                    Budget = p.ServicePost != null ? p.ServicePost.ServiceBudget : null,
                    EmploymentType = p.JobPost != null ? p.JobPost.EmploymentType ?? EmploymentTypeEnum.FullTime : EmploymentTypeEnum.FullTime,
                    Company = p.JobPost != null ? p.JobPost.Company : null,
                    WorkLocationType = p.JobPost != null ? p.JobPost.WorkLocationType ?? WorkLocationTypeEnum.OnSite : WorkLocationTypeEnum.OnSite,
                    JobLocation = p.JobPost != null ? p.JobPost.JobLocation : null,
                    ExpectedSalary = p.JobPost != null ? p.JobPost.ExpectedSalary : null,
                    PostInterests = p.PostInterests.Count,
                    Tags = p.PostTags.Select(pt => pt.TagName).ToList()
                }).FirstOrDefaultAsync();

            if (post == null) return NotFound(ApiResponse<string>.FailureResult("Post not found"));

            return Ok(ApiResponse<postsDto>.SuccessResult(post));
        }


        [HttpPost]
        public async Task<IActionResult> CreatePost([FromForm] CreatePostDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized(ApiResponse<string>.FailureResult("Invalid user token"));

            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.UserStatus != UserStatusEnum.Active)
            {
                return BadRequest(ApiResponse<string>.FailureResult("Your account is not active or does not exist"));
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            PostTypeEnum postType;
            if (dto.PostTypeId == 1) postType = PostTypeEnum.Question;
            else if (dto.PostTypeId == 2) postType = PostTypeEnum.Service;
            else if (dto.PostTypeId == 3) postType = PostTypeEnum.Job;
            else return BadRequest(ApiResponse<string>.FailureResult("Wrong Post Type"));

            try
            {
                // --- 1. PHOTO UPLOAD LOGIC ---
                string photoUrl = null;
                if (dto.AttachedPhoto != null && dto.AttachedPhoto.Length > 0)
                {
                    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "posts");
                    if (!Directory.Exists(uploadsFolder))
                        Directory.CreateDirectory(uploadsFolder);

                    var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.AttachedPhoto.FileName);
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.AttachedPhoto.CopyToAsync(fileStream);
                    }
                    photoUrl = $"/uploads/posts/{uniqueFileName}";
                }

                // --- 2. CREATE POST OBJECT ---
                var newPost = new Post
                {
                    AuthorId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow, // FIXED: Prevents DB Constraint Crash
                    PostTitle = dto.PostTitle,
                    PostDescription = dto.PostDescription,
                    PostDeadLine = dto.PostDeadLine ?? DateTime.UtcNow.AddDays(30),
                    PostType = postType,
                    FieldId = dto.FieldId,
                    PostStatus = PostStatusEnum.Open,
                    AttachedPhotoUrl = photoUrl,
                    RestrictToFieldExperts = dto.RestrictToFieldExperts // FIXED: Added missing mapping
                };

                // --- 3. ATTACH TAGS ---
                if (dto.Tags != null && dto.Tags.Any())
                {
                    newPost.PostTags = dto.Tags.Select(tag => new PostTag { TagName = tag }).ToList();
                }

                // --- 4. ATTACH SPECIFIC POST DETAILS ---
                if (postType == PostTypeEnum.Service)
                {
                    newPost.ServicePost = new ServicePost
                    {
                        ServiceBudget = dto.Budget ?? 0
                    };
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

                    newPost.JobPost = new JobPost
                    {
                        Company = dto.Company,
                        ExpectedSalary = dto.ExpectedSalary,
                        JobLocation = dto.JobLocation,
                        WorkLocationType = workLocation,
                        EmploymentType = employmentType
                    };
                }

                // --- 5. SAVE EVERYTHING AT ONCE ---
                _context.Posts.Add(newPost);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, ApiResponse<string>.FailureResult("An error occurred while saving the post.", new List<string> { ex.Message }));
            }

            return Ok(ApiResponse<string>.SuccessResult("Creates post successfully"));
        }

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdatePost([FromForm] UpdatePostDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized(ApiResponse<string>.FailureResult("Invalid user token."));


            var post = await _context.Posts
                .Include(p => p.Author)
                .Include(p => p.ServicePost)
                .Include(p => p.JobPost)
                .Include(p => p.PostTags)
            .FirstOrDefaultAsync(p => p.PostId == dto.PostId && p.AuthorId == userId);
            if (post == null)
            {
                return NotFound(ApiResponse<string>.FailureResult("Post not found."));
            }
            if (post.Author == null || post.Author.UserStatus != UserStatusEnum.Active)
            {
                return BadRequest(ApiResponse<string>.FailureResult("Your account is not active or does not exist"));
            }


            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                if (dto.AttachedPhoto != null && dto.AttachedPhoto.Length > 0)
                {
                    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "posts");
                    if (!Directory.Exists(uploadsFolder))
                        Directory.CreateDirectory(uploadsFolder);

                    var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.AttachedPhoto.FileName);
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.AttachedPhoto.CopyToAsync(fileStream);
                    }

                    // Optional: Delete the old file from disk here if post.AttachedPhotoUrl is not null

                    post.AttachedPhotoUrl = $"/uploads/posts/{uniqueFileName}";
                }
                post.UpdatedAt = DateTime.UtcNow;
                post.PostTitle = dto.PostTitle;
                post.PostDescription = dto.PostDescription;
                post.PostDeadLine = dto.PostDeadLine ?? DateTime.UtcNow.AddDays(30);
                post.FieldId = dto.FieldId;

                var incomingTags = dto.Tags?.Distinct().ToList() ?? new List<string>();
                var currentTags = post.PostTags.ToList();

                var tagsToRemove = currentTags.Where(t => !incomingTags.Contains(t.TagName)).ToList();
                var tagsToAdd = incomingTags.Where(nt => !currentTags.Any(t => t.TagName == nt)).ToList();

                _context.RemoveRange(tagsToRemove); // Only delete what was actually removed
                foreach (var tag in tagsToAdd)
                {
                    post.PostTags.Add(new PostTag { PostId = post.PostId, TagName = tag });
                }

                if (post.PostType == PostTypeEnum.Service && post.ServicePost != null)
                {
                    post.ServicePost.ServiceBudget = dto.Budget ?? 0;
                }
                else if (post.PostType == PostTypeEnum.Job && post.JobPost != null)

                {
                    WorkLocationTypeEnum? workLocationType = null;
                    EmploymentTypeEnum? employmentType = null;

                    if (dto.WorkLocationTypeId == 1) workLocationType = WorkLocationTypeEnum.OnSite;
                    else if (dto.WorkLocationTypeId == 2) workLocationType = WorkLocationTypeEnum.Hybrid; 
                    else if (dto.WorkLocationTypeId == 3) workLocationType = WorkLocationTypeEnum.Remote; 

                    if (dto.EmploymentTypeId == 1) employmentType = EmploymentTypeEnum.FullTime;
                    else if (dto.EmploymentTypeId == 2) employmentType = EmploymentTypeEnum.PartTime;
                    else if (dto.EmploymentTypeId == 3) employmentType = EmploymentTypeEnum.Contract;
                    else if (dto.EmploymentTypeId == 4) employmentType = EmploymentTypeEnum.Freelance;

                    post.JobPost.Company = dto.Company;
                    post.JobPost.ExpectedSalary = dto.ExpectedSalary;
                    post.JobPost.JobLocation = dto.JobLocation;
                    post.JobPost.WorkLocationType = workLocationType;
                    post.JobPost.EmploymentType = employmentType;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(ApiResponse<string>.SuccessResult("Post updated successfully"));
            }
                catch{
                await transaction.RollbackAsync();  
                return BadRequest(ApiResponse<string>.FailureResult("You must select a predefined field or enter a custom one."));

            }
           
        }


        [HttpPatch("{id}/status")]
        [Authorize]
        public async Task<IActionResult> ChangePostStatus(Guid id, int Status)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized(ApiResponse<string>.FailureResult("Invalid user token."));

            var post = await _context.Posts.FirstOrDefaultAsync(p => p.PostId == id && p.AuthorId == userId);

            if (post == null)
                return NotFound(ApiResponse<string>.FailureResult("Post not found or unauthorized."));

            if (Status == 2)
                post.PostStatus = PostStatusEnum.Completed;
            else if (Status == 3)
                post.PostStatus = PostStatusEnum.Cancelled;
            else if (Status == 1)
                post.PostStatus = PostStatusEnum.Open;

            post.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.SuccessResult("Status updated successfully"));
        }

    }
}
