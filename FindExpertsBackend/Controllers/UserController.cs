using FindExpertsBackend.Data;
using FindExpertsBackend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IO;
using System.Reflection.Metadata;

namespace FindExpertsBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<UserController> _logger;

        public UserController(ApplicationDbContext context, IWebHostEnvironment environment, ILogger<UserController> logger)
        {
            _context = context;
            _environment = environment;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpGet("profile/{userID?}")]
        public async Task<IActionResult> GetProfile(string? userID )
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var targetUserId = userID ?? currentUserId;

            var user = await _context.Users
                .Include(u => u.ExpertProfile)
                .FirstOrDefaultAsync(u => u.Id.ToString() == targetUserId);
 

            if (user == null) return NotFound(ApiResponse<object>.FailureResult("User not found"));

            var dto = new UserProfileDto
            {
                FullName = user.FullName??user.UserName.Split('@')[0],
                Email = user.Email,
                Avatar = user.Avatar,
                UserLocation = user.UserLocation,
                ExpertProfileId = user.ExpertProfile?.ExpertProfileId
            };

            return Ok(ApiResponse<UserProfileDto>.SuccessResult(dto, "Profile retrieved successfully."));
        }

        [HttpPut("location")]
        public async Task<IActionResult> UpdateLocation([FromBody] UpdateLocationDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id.ToString() == userId);

            if (user == null) return NotFound(ApiResponse<object>.FailureResult("User not found"));

            user.UserLocation = dto.UserLocation;
            var result = await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.SuccessResult(null, "Location updated."));
        }

        [HttpPost("avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id.ToString() == userId);

            if (user == null) return NotFound(ApiResponse<string>.FailureResult("User not found."));

            var webRootPath = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
            var uploadsFolder = Path.Combine(webRootPath, "uploads", "avatars");

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // 1. Store the old avatar URL before we change it
            var oldAvatarUrl = user.Avatar;

            // 2. Generate and save the NEW file
            var fileExtension = Path.GetExtension(file.FileName);
            var uniqueFileName = $"{userId}_{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var request = HttpContext.Request;
            var baseUrl = $"{request.Scheme}://{request.Host}";
            var imageUrl = $"{baseUrl}/uploads/avatars/{uniqueFileName}";

            // 3. Update the database
            user.Avatar = imageUrl;
            await _context.SaveChangesAsync();

            // 4. Safely delete the OLD file ONLY after the new one is completely saved
            if (!string.IsNullOrEmpty(oldAvatarUrl) && oldAvatarUrl.Contains("/uploads/avatars/"))
            {
                try
                {
                    // Extract just the filename (e.g., "123-abc.jpg") from the old URL
                    var oldFileName = Path.GetFileName(new Uri(oldAvatarUrl).LocalPath);
                    var oldFilePath = Path.Combine(uploadsFolder, oldFileName);

                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }
                catch (Exception)
                {
                }
            }

            return Ok(ApiResponse<string>.SuccessResult(imageUrl, "Avatar updated."));
        }
    }
}