using FindExpertsBackend.Data;
using FindExpertsBackend.DTOs;
using FindExpertsBackend.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FindExpertsBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }


        [HttpPut("users/{userId}/suspend")]
        public async Task<IActionResult> SuspendUser(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return NotFound(ApiResponse<string>.FailureResult("User not found."));

            user.UserStatus = UserStatusEnum.Banned;

            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.SuccessResult($"User status updated to {user.UserStatus}."));
        }


        [HttpPut("users/{userId}/activate")]
        public async Task<IActionResult> ActivateUser(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return NotFound(ApiResponse<string>.FailureResult("User not found."));

            user.UserStatus = UserStatusEnum.Active;

            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.SuccessResult($"User status updated to {user.UserStatus}."));
        }
    }
}
