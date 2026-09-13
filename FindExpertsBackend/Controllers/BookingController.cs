using FindExpertsBackend.Data;
using FindExpertsBackend.DTOs;
using FindExpertsBackend.Models;
using FindExpertsBackend.Models.Enums;
using FindExpertsBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;


namespace FindExpertsBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;


        public BookController(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
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
                         && b.BookingStatus != BookingStatusEnum.Cancelled && b.BookingStatus != BookingStatusEnum.Rejected )
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


            var userExpert = await _context.ExpertProfiles.FirstOrDefaultAsync(ep => ep.UserId == userId);
            var userExpertId = userExpert?.ExpertProfileId;

            if (dto.ExpertId == userExpertId)
                return BadRequest(ApiResponse<string>.FailureResult("You can't book yourself"));

            if (dto.BookingStartTime.Date < DateTime.UtcNow.Date)
                return BadRequest(ApiResponse<string>.FailureResult("Booking date cannot be in the past."));

            // 1. Calculate requested timespan
            var requestedStart = dto.BookingStartTime;
            var requestedEnd = requestedStart.AddMinutes(dto.BookingDuration);

            // 2. Check for conflicts with existing non-cancelled bookings
            var hasConflict = await _context.Bookings
                .AnyAsync(b => b.ExpertId == dto.ExpertId
                            && b.BookingStatus != BookingStatusEnum.Cancelled && b.BookingStatus != BookingStatusEnum.Rejected
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

            var expertUser = await _context.ExpertProfiles.Include(e => e.User).FirstOrDefaultAsync(e => e.ExpertProfileId == dto.ExpertId);
            var clientUser = await _context.Users.FindAsync(userId); 
            await _notificationService.CreateNotificationAsync(
                userId: expertUser.User.Id,
                type: NotificationTypeEnum.NewMessage,
                title: "New Message",
                text: $"You have a new Booking request from {clientUser?.FullName}"
            );

            return Ok(ApiResponse<string>.SuccessResult("Consultation requested successfully."));
        }


        [HttpPut("{bookingId}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateBookingStatus(Guid bookingId, [FromBody] UpdateBookingStatusDto dto )
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized(ApiResponse<string>.FailureResult("Invalid token"));

            // Fetch booking and include the Expert to verify ownership
            var booking = await _context.Bookings
                    .Include(b => b.Expert)
                    .ThenInclude(e => e.User) // Include the expert's user info
                    .Include(b => b.User) // Include the client's user info
                    .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            if (booking == null)
                return NotFound(ApiResponse<string>.FailureResult("Booking not found."));

            bool isClient = booking.UserId == userId;
            bool isExpert = booking.Expert.UserId == userId;

            if (!isClient && !isExpert)
                return Forbid(); // The user has no relation to this booking

            var currentUtc = DateTime.UtcNow;

            Guid notifTargetUserId = Guid.Empty;
            NotificationTypeEnum notifType = NotificationTypeEnum.NewMessage;
            string notifTitle = "";
            string notifText = "";

            // --- RULE 1: CLIENT LOGIC ---
            if (isClient)
            {
                if (dto.NewStatus != BookingStatusEnum.Cancelled)
                    return BadRequest(ApiResponse<string>.FailureResult("Clients can only cancel bookings."));

                if (booking.BookingStatus != BookingStatusEnum.Pending && booking.BookingStatus != BookingStatusEnum.Accepted)
                    return BadRequest(ApiResponse<string>.FailureResult("You can only cancel pending or accepted bookings."));

                booking.BookingStatus = BookingStatusEnum.Cancelled;
                booking.UpdatedAt = currentUtc;

                var client = await _context.Users.FindAsync(userId);

                notifTargetUserId = booking.Expert.UserId; 
                notifType = NotificationTypeEnum.BookingCancelled;
                notifTitle = "Booking Cancelled";
                notifText = $"The session with {booking.User.FullName} was cancelled.";

            }

            // --- RULE 2: EXPERT LOGIC ---
            else if (isExpert)
            {
                // Expert Accepting or Rejecting
                if (dto.NewStatus == BookingStatusEnum.Accepted || dto.NewStatus == BookingStatusEnum.Rejected)
                {
                    if (booking.BookingStatus != BookingStatusEnum.Pending)
                        return BadRequest(ApiResponse<string>.FailureResult($"You can only {dto.NewStatus} a Pending booking."));

                    booking.BookingStatus = dto.NewStatus;
                    booking.UpdatedAt = currentUtc;
                    if (dto.NewStatus == BookingStatusEnum.Accepted && !string.IsNullOrEmpty(dto.MeetingLink))
                        booking.MeetingUrl = dto.MeetingLink.Trim();

                    // Setup Notification for Client
                    notifTargetUserId = booking.UserId;
                    notifType = dto.NewStatus == BookingStatusEnum.Accepted ? NotificationTypeEnum.BookingAccepted : NotificationTypeEnum.BookingCancelled;
                    notifTitle = $"Booking {dto.NewStatus}";
                    notifText = $"Your booking with {booking.Expert.User.FullName} is now {dto.NewStatus}.";
                }
                // Expert Marking as Completed
                else if (dto.NewStatus == BookingStatusEnum.Completed)
                {
                    if (booking.BookingStatus != BookingStatusEnum.Accepted)
                        return BadRequest(ApiResponse<string>.FailureResult("Only Accepted bookings can be marked as Completed."));

                    // Ensure the booking end time has actually passed
                    var endTime = booking.BookingStartTime.AddMinutes(booking.BookingDuration);
                    if (endTime > currentUtc)
                        return BadRequest(ApiResponse<string>.FailureResult("You cannot mark a booking as completed before its scheduled end time has passed."));

                    booking.BookingStatus = BookingStatusEnum.Completed;
                }
                else
                {
                    return BadRequest(ApiResponse<string>.FailureResult("Invalid status update requested."));
                }
            }

            booking.UpdatedAt = currentUtc;
            await _context.SaveChangesAsync();

            var expert = await _context.Users.FindAsync(userId);

            if (notifTargetUserId != Guid.Empty)
            {
                await _notificationService.CreateNotificationAsync(
                    userId: notifTargetUserId,
                    type: notifType,
                    title: notifTitle,
                    text: notifText
                );
            }

            return Ok(ApiResponse<string>.SuccessResult("Booking status updated successfully."));
        }


        [HttpPost("review")]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid reviewerId))
            {
                return Unauthorized(ApiResponse<string>.FailureResult("Invalid user token."));
            }

            // 1. Verify the booking exists and belongs to the current user
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.BookingId == dto.BookingId);

            if (booking == null)
            {
                return NotFound(ApiResponse<string>.FailureResult("Booking not found."));
            }

            // 2. Ensure a review for this booking doesn't already exist
            var existingReview = await _context.Reviews
                .FirstOrDefaultAsync(r => r.BookingId == dto.BookingId);

            if (existingReview != null)
            {
                return BadRequest(ApiResponse<string>.FailureResult("You have already reviewed this booking."));
            }

            // 3. Create and add the Review record
            var review = new Review
            {
                ReviewerId = reviewerId,
                ExpertId = dto.ExpertId,
                BookingId = dto.BookingId,
                Rating = dto.Rating,
                ReviewComment = dto.ReviewComment,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);

            // 4. Handle Guarantee checkbox logic if selected
            if (dto.IsGuaranteed)
            {
                // Check if a guarantee already exists between this client and expert to prevent duplicates
                var existingGuarantee = await _context.Guarantees
                    .FirstOrDefaultAsync(g => g.ClientId == reviewerId && g.ExpertId == dto.ExpertId);

                if (existingGuarantee == null)
                {
                    var guarantee = new Guarantee
                    {
                        ClientId = reviewerId,
                        ExpertId = dto.ExpertId,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Guarantees.Add(guarantee);
                }
            }

            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.SuccessResult("Review submitted successfully!"));
        }
    }
}