using FindExpertsBackend.Models.Enums;

namespace FindExpertsBackend.Services
{
    public interface INotificationService
    {
        Task CreateNotificationAsync(Guid userId, NotificationTypeEnum type, string title, string text);
    }
}
