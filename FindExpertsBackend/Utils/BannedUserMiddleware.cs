using FindExpertsBackend.Data;
using FindExpertsBackend.DTOs;
using FindExpertsBackend.Models.Enums;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims; // Required for FindFirstValue

namespace FindExpertsBackend.Utils
{
    public class BannedUserMiddleware
    {
        private readonly RequestDelegate _next;

        public BannedUserMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ApplicationDbContext dbContext)
        {

            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userIdStr = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
                Console.WriteLine($"Extracted ID Claim: '{userIdStr}'");

                if (Guid.TryParse(userIdStr, out Guid userId))
                {
                    var userStatus = await dbContext.Users
                        .Where(u => u.Id == userId)
                        .Select(u => (UserStatusEnum?)u.UserStatus)
                        .FirstOrDefaultAsync();


                    if (userStatus == UserStatusEnum.Banned)
                    {
                        Console.WriteLine("BLOCKING USER: Returning 403 Forbidden");
                        context.Response.StatusCode = StatusCodes.Status423Locked;
                        context.Response.ContentType = "application/json";
                        var response = ApiResponse<string>.FailureResult("Your account has been banned by an administrator.");
                        await context.Response.WriteAsJsonAsync(response);
                        return;
                    }
                }

            }

            await _next(context);
        }
    }
}