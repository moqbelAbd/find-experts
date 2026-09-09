using FindExpertsBackend.Data;
using FindExpertsBackend.DTOs;
using FindExpertsBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace FindExpertsBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostInterestController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PostInterestController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("{postId}")]
        [Authorize]
        public async Task<IActionResult> ExpressInterest(Guid postId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized(ApiResponse<string>.FailureResult("Invalid token"));

            // Get the user's Expert Profile
            var expert = await _context.ExpertProfiles.FirstOrDefaultAsync(e => e.UserId == userId);

            if (expert == null)
                return BadRequest(ApiResponse<string>.FailureResult("You must complete your Expert Profile to apply."));

            // Check if already applied
            var alreadyApplied = await _context.PostInterests
                .AnyAsync(pi => pi.PostId == postId && pi.ExpertId == expert.ExpertProfileId);

            var post = await _context.Posts.FindAsync(postId);
            if (post != null && post.PostDeadLine <= DateTime.UtcNow)
                return BadRequest(ApiResponse<string>.FailureResult("Post is closed"));

            if (alreadyApplied)
                return BadRequest(ApiResponse<string>.FailureResult("You have already expressed interest in this post."));

            var interest = new PostInterest
            {
                PostId = postId,
                ExpertId = expert.ExpertProfileId,
                CreatedAt = DateTime.UtcNow
            };

            _context.PostInterests.Add(interest);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.SuccessResult("Interest registered successfully!"));
        }

        // 2. Get Interests (For Post Author)
        [HttpGet("{postId}")]
        [Authorize]
        public async Task<IActionResult> GetPostInterests(Guid postId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized();

            // Verify the current user is the author of the post
            var isAuthor = await _context.Posts.AnyAsync(p => p.PostId == postId && p.AuthorId == userId);
            if (!isAuthor)
                return Forbid();

            var interests = await _context.PostInterests
                .Include(pi => pi.Expert)
                .ThenInclude(e => e.User)
                .Where(pi => pi.PostId == postId)
                .OrderByDescending(pi => pi.CreatedAt)
                .Select(pi => new InterestDto
                {
                    ExpertId = pi.ExpertId,
                    UserId = pi.Expert.UserId,
                    FullName = pi.Expert.User.FullName,
                    Avatar = pi.Expert.User.Avatar,
                    AppliedAt = pi.CreatedAt
                }).ToListAsync();

            return Ok(ApiResponse<List<InterestDto>>.SuccessResult(interests));
        }
    }
}
