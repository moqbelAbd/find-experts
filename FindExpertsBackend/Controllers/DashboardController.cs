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
                    ConsultantAvatar = b.Expert.User.Avatar,
                    HasReviewed = _context.Reviews.Any(r => r.BookingId == b.BookingId)
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



        [HttpGet("admin/overview")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminOverview()
        {
            var now = DateTime.UtcNow;
            var startOfCurrentMonth = new DateTime(now.Year, now.Month, 1);
            var startOfLastMonth = startOfCurrentMonth.AddMonths(-1);
            var startOfYear = new DateTime(now.Year, 1, 1);

            var users = await _context.Users.AsNoTracking().ToListAsync();
            var experts = await _context.ExpertProfiles.AsNoTracking().Include(e => e.Guarantees).ToListAsync();
            var bookings = await _context.Bookings.AsNoTracking().ToListAsync();
            var posts = await _context.Posts.AsNoTracking().ToListAsync();

            double CalcGrowth(double current, double previous)
            {
                if (previous == 0) return current > 0 ? 100 : 0;
                return Math.Round(((current - previous) / previous) * 100, 1);
            }

            // Calculate Users
            var currentUsers = users.Count(u => u.CreatedAt >= startOfCurrentMonth);
            var prevUsers = users.Count(u => u.CreatedAt >= startOfLastMonth && u.CreatedAt < startOfCurrentMonth);

            // Calculate Bookings
            var currentBookings = bookings.Count(b => b.CreatedAt >= startOfCurrentMonth);
            var prevBookings = bookings.Count(b => b.CreatedAt >= startOfLastMonth && b.CreatedAt < startOfCurrentMonth);

            // Calculate Revenue
            var currentRevenue = bookings.Where(b => b.CreatedAt >= startOfCurrentMonth && b.BookingStatus == BookingStatusEnum.Completed).Sum(b => (double)b.BookingPrice);
            var prevRevenue = bookings.Where(b => b.CreatedAt >= startOfLastMonth && b.CreatedAt < startOfCurrentMonth && b.BookingStatus == BookingStatusEnum.Completed).Sum(b => (double)b.BookingPrice);

            // Calculate Experts 
            var currentExperts = experts.Count(e => e.CreatedAt >= startOfCurrentMonth);
            var prevExperts = experts.Count(e => e.CreatedAt >= startOfLastMonth && e.CreatedAt < startOfCurrentMonth);

            // Calculate Posts 
            var openPosts = posts.Where(p => p.PostStatus == PostStatusEnum.Open).ToList();
            var currentPosts = openPosts.Count(p => p.CreatedAt >= startOfCurrentMonth);
            var prevPosts = openPosts.Count(p => p.CreatedAt >= startOfLastMonth && p.CreatedAt < startOfCurrentMonth);

            var monthlyBookings = bookings
                .Where(b => b.CreatedAt >= startOfYear)
                .GroupBy(b => b.CreatedAt.Month)
                .Select(g => new MonthlyStatDto
                {
                    Month = new DateTime(now.Year, g.Key, 1).ToString("MMM"),
                    Total = g.Count()
                })
                .OrderBy(m => DateTime.ParseExact(m.Month, "MMM", System.Globalization.CultureInfo.InvariantCulture).Month)
                .ToList();

// 4. Expert Guarantee Tiers (Donut Chart)
var guaranteeStats = new GuaranteeStatsDto
{
    TotalGuarantees = experts.Count(e => e.Guarantees.Count >= 1),
    GreenCount = experts.Count(e => e.Guarantees.Count >= 1 && e.Guarantees.Count < 3), // Starts at 1
    BronzeCount = experts.Count(e => e.Guarantees.Count >= 3 && e.Guarantees.Count < 6),
    SilverCount = experts.Count(e => e.Guarantees.Count >= 6 && e.Guarantees.Count < 10),
    GoldCount = experts.Count(e => e.Guarantees.Count >= 10)
};

            var response = new AdminOverviewDto
            {
                TotalUsers = new StatCardDto { Value = users.Count, GrowthPercentage = CalcGrowth(currentUsers, prevUsers) },
                ActiveExperts = new StatCardDto { Value = experts.Count, GrowthPercentage = CalcGrowth(currentExperts, prevExperts) }, 
                TotalBookings = new StatCardDto { Value = bookings.Count, GrowthPercentage = CalcGrowth(currentBookings, prevBookings) },
                TotalRevenue = new StatCardDto { Value = (decimal)bookings.Where(b => b.BookingStatus == BookingStatusEnum.Completed).Sum(b => b.BookingPrice), GrowthPercentage = CalcGrowth(currentRevenue, prevRevenue) },
                OpenPosts = new StatCardDto { Value = openPosts.Count, GrowthPercentage = CalcGrowth(currentPosts, prevPosts) }, 
                MonthlyBookings = monthlyBookings,
                ExpertGuarantees = guaranteeStats
            };

            return Ok(ApiResponse<AdminOverviewDto>.SuccessResult(response));
        }

        [HttpGet("admin/consultations")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminConsultations()
        {
            var bookings = await _context.Bookings
                .AsNoTracking()
                .Include(b => b.User)
                .Include(b => b.Expert)
                    .ThenInclude(e => e.User)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            var total = bookings.Count;

            var response = new AdminConsultationsDto
            {
                TotalBookings = total,
                Completed = bookings.Count(b => b.BookingStatus == BookingStatusEnum.Completed),
                Pending = bookings.Count(b => b.BookingStatus == BookingStatusEnum.Pending),
                Accepted = bookings.Count(b => b.BookingStatus == BookingStatusEnum.Accepted),
                Cancelled = bookings.Count(b => b.BookingStatus == BookingStatusEnum.Cancelled),
                Rejected = bookings.Count(b => b.BookingStatus == BookingStatusEnum.Rejected),

                Bookings = bookings.Select(b => new AdminBookingItemDto
                {
                    BookingId = b.BookingId,
                    ClientName = b.User.FullName ?? b.User.UserName,
                    ClientId = b.UserId,
                    ExpertName = b.Expert.User.FullName ?? b.Expert.User.UserName,
                    ExpertId = b.ExpertId,
                    BookingTime = b.BookingStartTime,
                    BookingDuration = b.BookingDuration,
                    BookingPrice = b.BookingPrice,
                    BookingStatus = b.BookingStatus
                }).ToList()
            };

            return Ok(ApiResponse<AdminConsultationsDto>.SuccessResult(response));
        }

        [HttpGet("admin/users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminUsers()
        {
            var users = await _context.Users
                .AsNoTracking()
                .Include(u => u.ExpertProfile)
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new AdminUsersItemDto
                {
                    UserId = u.Id,
                    FullName = u.FullName ?? u.UserName,
                    Email = u.Email,
                    Location = u.UserLocation, 
                    Avatar = u.Avatar,
                    Role = u.ExpertProfile != null ? "Expert" : "User",
                    JoinedAt = u.CreatedAt,
                    Status = u.UserStatus.ToString()
                })
                .ToListAsync();

            return Ok(ApiResponse<List<AdminUsersItemDto>>.SuccessResult(users));
        }


    }
}
