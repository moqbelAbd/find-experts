using FindExpertsBackend.Data;
using FindExpertsBackend.DTOs;
using FindExpertsBackend.Models;
using FindExpertsBackend.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;


namespace FindExpertsBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BookController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("expert/{expertId}/setup")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBookingSetup(Guid expertId)
        {
            // 1. Fetch expert
            var expert = await _context.ExpertProfiles
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.ExpertProfileId == expertId);

            if (expert == null)
                return NotFound(ApiResponse<string>.FailureResult("Expert not found"));

            //  Fetch Detailed Reviews & Calculate Averages
            var reviews = await _context.Reviews
                .Include(r => r.Reviewer)
                .Where(r => r.ExpertId == expertId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new BookingInformationDto.ReviewDto
                {
                    ReviewId = r.ReviewId,
                    ReviewerName = r.Reviewer.FullName,
                    ReviewerAvatar = r.Reviewer.Avatar,
                    Rating = r.Rating,
                    Comment = r.ReviewComment,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            var avgRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0.0;
            var reviewsCount = reviews.Count;

            var guaranteesCount = await _context.Guarantees
                .CountAsync(g => g.ExpertId == expertId);

            // Fetch upcoming booked slots
            var currentUtc = DateTime.UtcNow;
            var upcomingBookings = await _context.Bookings
                .Where(b => b.ExpertId == expertId
                         && b.BookingStartTime >= currentUtc
                         && b.BookingStatus != BookingStatusEnum.Cancelled)
                .Select(b => new BookingInformationDto.BookedSlotDto
                {
                    Start = b.BookingStartTime,
                    Duration = b.BookingDuration
                })
                .ToListAsync();

            var packages = await _context.ConsultationPackages
                .Where(p => p.ExpertId == expertId)
                .Select(p => new BookingInformationDto.BookingPackageDto
                {
                    Duration = p.Duration,
                    Price = p.Price
                })
                .ToListAsync();

            var availabilities = await _context.ExpertAvailabilities
                .Where(ea => ea.ExpertId == expertId )
                .Select(ea => new BookingInformationDto.ExpertScheduleDto
                {
                    DayOfWeek = ea.DayOfWeek,
                    StartTime = ea.StartTime.ToString(@"hh\:mm"), // Formats TimeSpan to "HH:mm"
                    EndTime = ea.EndTime.ToString(@"hh\:mm")
                })
                .ToListAsync();


            var setupDto = new BookingInformationDto.BookingSetupDto
            {
                ExpertId = expert.ExpertProfileId,
                FullName = expert.User.FullName,
                JobTitle = expert.JobTitle,
                Avatar = expert.User.Avatar,
                Rating = Math.Round(avgRating, 1),
                ReviewsCount = reviewsCount,
                Guarantees = guaranteesCount,
                Packages = packages,
                Schedule = availabilities, 
                BookedSlots = upcomingBookings,
                Reviews = reviews          
            };

           
            return Ok(ApiResponse<BookingInformationDto.BookingSetupDto>.SuccessResult(setupDto));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized(ApiResponse<string>.FailureResult("Invalid user token"));


            var userExpert = await _context.ExpertProfiles.FirstAsync(ep => ep.UserId == userId);
            var userExpertId = userExpert.ExpertProfileId;

            if (dto.ExpertId == userExpertId)
                return BadRequest(ApiResponse<string>.FailureResult("You can't book yourself"));

            if (dto.BookingStartTime <= DateTime.UtcNow)
                return BadRequest(ApiResponse<string>.FailureResult("Booking time must be in the future."));
            // 1. Calculate requested timespan
            var requestedStart = dto.BookingStartTime;
            var requestedEnd = requestedStart.AddMinutes(dto.BookingDuration);

            // 2. Check for conflicts with existing non-cancelled bookings
            var hasConflict = await _context.Bookings
                .AnyAsync(b => b.ExpertId == dto.ExpertId
                            && b.BookingStatus != BookingStatusEnum.Cancelled
                            && b.BookingStartTime < requestedEnd
                            && b.BookingStartTime.AddMinutes(b.BookingDuration) > requestedStart);

            if (hasConflict)
                return BadRequest(ApiResponse<string>.FailureResult("The selected time slot is no longer available."));

            // 3. Create and save the booking
            var booking = new Booking
            {
                UserId = userId,
                ExpertId = dto.ExpertId,
                BookingStartTime = dto.BookingStartTime,
                BookingDuration = dto.BookingDuration,
                BookingPrice = dto.BookingPrice,
                BookingStatus = BookingStatusEnum.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.SuccessResult("Consultation requested successfully."));
        }
    }
}