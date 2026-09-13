using FindExpertsBackend.Data;
using FindExpertsBackend.Models;
using FindExpertsBackend.Models.Enums;

namespace FindExpertsBackend.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;

        public NotificationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task CreateNotificationAsync(Guid userId, NotificationTypeEnum type, string title, string text)
        {
            var notification = new Notification
            {
                UserId = userId,
                Type = type,
                NotificationTitle = title,
                NotificationText = text,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }
    }
}