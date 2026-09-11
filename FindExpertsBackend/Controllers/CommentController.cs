using FindExpertsBackend.Data;
using FindExpertsBackend.DTOs;
using FindExpertsBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using FindExpertsBackend.Models.Enums;

namespace FindExpertsBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CommentController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("{postId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPostComments(Guid postId, [FromQuery] string sort = "newest")
        {
            var query = _context.Comments.Where(c => c.PostId == postId && !c.IsDeleted);

            if (sort == "oldest")
                query = query.OrderBy(c => c.CreatedAt);
            else
                query = query.OrderByDescending(c => c.CreatedAt);

            var comments = await query.Select(c => new CommentsDto
            {
                CommentId = c.CommentId,
                ParentCommentId = c.ParentCommentId,
                Content = c.CommentContent, 
                CreatedAt = c.CreatedAt,
                AuthorId = c.AuthorId,
                AuthorName = c.Author.FullName,
                AuthorAvatar = c.Author.Avatar
            }).ToListAsync();

            return Ok(ApiResponse<List<CommentsDto>>.SuccessResult(comments));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddComment([FromBody] CreateCommentDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized(ApiResponse<string>.FailureResult("Invalid token"));

            var post = await _context.Posts.FindAsync(dto.PostId);
            if(post != null && post.PostStatus != PostStatusEnum.Open)
                return BadRequest(ApiResponse<string>.FailureResult("Currently the post isn't opend for comments"));

            var comment = new Comment 
            {
                PostId = dto.PostId,
                ParentCommentId = dto.ParentCommentId,
                AuthorId = userId,
                CommentContent = dto.Content,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.SuccessResult("Comment added successfully"));
        }

        [HttpPut("{commentId}")]
        [Authorize]
        public async Task<IActionResult> EditComment(Guid commentId, [FromBody] EditCommentDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized(ApiResponse<string>.FailureResult("Invalid token"));

            var comment = await _context.Comments.FirstOrDefaultAsync(c => c.CommentId == commentId && !c.IsDeleted);

            if (comment == null)
                return NotFound(ApiResponse<string>.FailureResult("Comment not found"));

            if (comment.AuthorId != userId)
                return Forbid(); // Alternatively, return Unauthorized

            comment.CommentContent = dto.Content;
            comment.UpdatedAt = DateTime.UtcNow; 

            await _context.SaveChangesAsync();
            return Ok(ApiResponse<string>.SuccessResult("Comment updated"));
        }

        [HttpDelete("{commentId}")]
        [Authorize]
        public async Task<IActionResult> DeleteComment(Guid commentId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized(ApiResponse<string>.FailureResult("Invalid token"));

            var comment = await _context.Comments.FirstOrDefaultAsync(c => c.CommentId == commentId && !c.IsDeleted);

            if (comment == null)
                return NotFound(ApiResponse<string>.FailureResult("Comment not found"));

            if (comment.AuthorId != userId)
                return Forbid();

            // Soft delete
            comment.IsDeleted = true;

            await _context.SaveChangesAsync();
            return Ok(ApiResponse<string>.SuccessResult("Comment deleted"));
        }
    }
}
