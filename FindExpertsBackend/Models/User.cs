using FindExpertsBackend.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FindExpertsBackend.Models
{
    public class User : ApplicationUser
    {

        [MaxLength(500)]
        public string Avatar { get; set; }

        [MaxLength(255)]
        public string UserLocation { get; set; }

        public UserStatusEnum UserStatus { get; set; } = UserStatusEnum.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
 

        public virtual ExpertProfile ExpertProfile { get; set; }

        public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

        [InverseProperty(nameof(Review.Reviewer))]
        public virtual ICollection<Review> ReviewsGiven { get; set; } = new List<Review>();

        [InverseProperty(nameof(Guarantee.Client))]
        public virtual ICollection<Guarantee> GuaranteesGiven { get; set; } = new List<Guarantee>();

        [InverseProperty(nameof(Message.Sender))]
        public virtual ICollection<Message> MessagesSent { get; set; } = new List<Message>();

        [InverseProperty(nameof(Message.Receiver))]
        public virtual ICollection<Message> MessagesReceived { get; set; } = new List<Message>();

        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public virtual ICollection<FavoriteConsultant> FavoriteConsultants { get; set; } = new List<FavoriteConsultant>();
    }
}
