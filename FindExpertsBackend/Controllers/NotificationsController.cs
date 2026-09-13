using FindExpertsBackend.Data;
using FindExpertsBackend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace FindExpertsBackend.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NotificationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllNotifications()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid currentUserId)) return Unauthorized();

            var notifications = await _context.Notifications
                .Where(n => n.UserId == currentUserId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NotificationDto
                {
                    NotificationId = n.NotificationId,
                    Type = (int)n.Type,
                    NotificationTitle = n.NotificationTitle,
                    NotificationText = n.NotificationText,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt
                })
                .ToListAsync();

            return Ok(ApiResponse<List<NotificationDto>>.SuccessResult(notifications));
        }

        // DELETE: api/notifications/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(Guid id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid currentUserId)) return Unauthorized();

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == id && n.UserId == currentUserId);

            if (notification == null)
            {
                return NotFound(ApiResponse<string>.FailureResult("Notification not found."));
            }

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.SuccessResult(null, "Notification deleted."));
        }

        // DELETE: api/notifications
        [HttpDelete]
        public async Task<IActionResult> DeleteAllNotifications()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid currentUserId)) return Unauthorized();

            var notifications = await _context.Notifications
                .Where(n => n.UserId == currentUserId)
                .ToListAsync();

            if (!notifications.Any())
            {
                return Ok(ApiResponse<string>.SuccessResult(null, "No notifications to delete."));
            }

            _context.Notifications.RemoveRange(notifications);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.SuccessResult(null, "All notifications deleted."));
        }
    }
}

