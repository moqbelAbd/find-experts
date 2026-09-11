using FindExpertsBackend.Data;
using FindExpertsBackend.DTOs;
using FindExpertsBackend.Models;
using FindExpertsBackend.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FindExpertsBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> UserDashboard()
        {

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid userId))

                return Unauthorized(ApiResponse<string>.FailureResult("Invalid token"));

            var user = await _context.Users.
                Include(u => u.ExpertProfile)
                .FirstAsync(u=> u.Id == userId);

            var bookings = await _context.Bookings
                .AsNoTracking() // Drastically improves read performance
                .Include(b => b.Expert)
                .ThenInclude(e => e.User)
                 //.ThenInclude(u => u.ExpertProfile)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.BookingStatus)
                .ThenByDescending(b => b.CreatedAt)
                .ThenByDescending(b => b.UpdatedAt)
                .ToListAsync();

            var TotalBookings = bookings.Count();
            var PendingBookings = bookings.Where(b => b.BookingStatus == BookingStatusEnum.Pending).Count();
            var CompletedBookings = bookings.Where(b => b.BookingStatus == BookingStatusEnum.Completed).Count();
            var UpcomingBookings = bookings.Where(b => b.BookingStartTime > DateTime.UtcNow).Count();

            var response = new UserDashboardResponseDto
            {
                UserName = user.FullName,
                UserEmail = user.Email,
                UserAvatar = user.Avatar,
                UserExpertProfileId = user.ExpertProfile?.ExpertProfileId,
                TotalBookings = TotalBookings,
                PendingBookings = PendingBookings,
                CompletedBookings = CompletedBookings,
                UpcomingBookings = UpcomingBookings,

                HistoryItem = bookings.Select(b => new BookingHistoryItem
                {
                   BookingId = b.BookingId,
                   BookingStatus = b.BookingStatus.ToString(),
                   BookingTime = b.BookingStartTime,
                   BookingPrice = b.BookingPrice,
                    BookingDuration = b.BookingDuration,
                   MeetingLink = b.MeetingUrl,
                    ConsultantId = b.ExpertId,
                    ConsultantJobTitle = b.Expert.JobTitle,
                    ConsultantName = b.Expert.User.FullName,
                    ConsultantAvatar = b.Expert.User.Avatar
                }).ToList()

            };

            return Ok(ApiResponse<UserDashboardResponseDto>.SuccessResult(response));
        }


        [HttpGet("expert/{expertId}")]
        [Authorize]
        public async Task<IActionResult> ExpertDashboard(Guid expertId)
        {
            // 1. Fetch Expert Profile with related stats
            var expert = await _context.ExpertProfiles
                .AsNoTracking()
                .Include(e => e.User)
                .Include(e => e.Reviews)
                .Include(e => e.Guarantees)
                .Include(e => e.ConsultationPackages)
                .FirstOrDefaultAsync(e => e.ExpertProfileId == expertId);

            if (expert == null)
                return NotFound(ApiResponse<string>.FailureResult("Expert not found"));

            // 2. Fetch all bookings for this expert
            var bookings = await _context.Bookings
                .AsNoTracking()
                .Include(b => b.User)
                .Where(b => b.ExpertId == expertId)
                .OrderBy(b => b.BookingStartTime)
                .ToListAsync();

            var avgRating = expert.Reviews.Any() ? expert.Reviews.Average(r => r.Rating) : 0.0;

            // Map bookings to DTOs
            var mappedBookings = bookings.Select(b => new ExpertBookingItemDto
            {
                BookingId = b.BookingId,
                ClientId = b.UserId,
                ClientName = b.User.FullName ?? b.User.UserName,
                ClientAvatar = b.User.Avatar,
                BookingTime = b.BookingStartTime,
                BookingDuration = b.BookingDuration,
                BookingPrice = b.BookingPrice,
                BookingStatus = b.BookingStatus,
                MeetingLink = b.MeetingUrl
            }).ToList();

            var response = new ExpertDashboardResponseDto
            {
                ExpertId = expert.ExpertProfileId,
                ExpertName = expert.User.FullName ?? expert.User.UserName,
                ExpertAvatar = expert.User.Avatar,
                GuaranteesCount = expert.Guarantees.Count,
                AverageRating = Math.Round(avgRating, 1),
                TotalConsultations = bookings.Count,
                BasePrice = expert.ConsultationPackages.Any() ? expert.ConsultationPackages.Min(p => p.Price) : 0,

                // Filter lists for the tabs
                PendingRequests = mappedBookings.Where(b => b.BookingStatus == BookingStatusEnum.Pending).ToList(),
                UpcomingConsultations = mappedBookings.Where(b => b.BookingStatus == BookingStatusEnum.Accepted).ToList(),
                History = mappedBookings
                    .Where(b => b.BookingStatus == BookingStatusEnum.Completed ||
                                b.BookingStatus == BookingStatusEnum.Cancelled ||
                                b.BookingStatus == BookingStatusEnum.Rejected)
                    .OrderByDescending(b => b.BookingTime)
                    .ToList()
            };

            return Ok(ApiResponse<ExpertDashboardResponseDto>.SuccessResult(response));
        }

    }
}
