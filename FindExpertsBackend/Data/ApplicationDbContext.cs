using FindExpertsBackend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FindExpertsBackend.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Field> Fields { get; set; }
        public DbSet<Skill> Skills { get; set; }
        public DbSet<ExpertProfile> ExpertProfiles { get; set; }
        public DbSet<ExpertSkill> ExpertSkills { get; set; }
        public DbSet<ConsultationPackage> ConsultationPackages { get; set; }
        public DbSet<Experience> Experiences { get; set; }
        public DbSet<Certificate> Certificates { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<ServicePost> ServicePosts { get; set; }
        public DbSet<JobPost> JobPosts { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<ServiceInterest> ServiceInterests { get; set; }
        public DbSet<JobInterest> JobInterests { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<ExpertAvailability> ExpertAvailabilities { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Guarantee> Guarantees { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<FavoriteConsultant> FavoriteConsultants { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Composite Keys
            modelBuilder.Entity<ExpertSkill>()
                .HasKey(es => new { es.ExpertId, es.SkillId });

            modelBuilder.Entity<FavoriteConsultant>()
                .HasKey(fc => new { fc.UserId, fc.ExpertId });

            // Unique Indexes
            modelBuilder.Entity<Guarantee>()
                .HasIndex(g => new { g.ClientId, g.ExpertId })
                .IsUnique();


            // ==========================================================
            //  PREVENT MULTIPLE CASCADE DELETE PATHS
            // ==========================================================

            // 1. Messages
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany(u => u.MessagesSent)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Receiver)
                .WithMany(u => u.MessagesReceived)
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            // 2. Reviews
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Reviewer)
                .WithMany(u => u.ReviewsGiven)
                .HasForeignKey(r => r.ReviewerId)
                .OnDelete(DeleteBehavior.Restrict);

            // 3. Comments 
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Author)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            // 4. Bookings (The error you just got)
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // 5. Guarantees 
            modelBuilder.Entity<Guarantee>()
                .HasOne(g => g.Client)
                .WithMany(u => u.GuaranteesGiven)
                .HasForeignKey(g => g.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            // 6. Service Interests
            modelBuilder.Entity<ServiceInterest>()
                .HasOne(si => si.Expert)
                .WithMany(e => e.ServiceInterests)
                .HasForeignKey(si => si.ExpertId)
                .OnDelete(DeleteBehavior.Restrict);

            // 7. Job Interests
            modelBuilder.Entity<JobInterest>()
                .HasOne(ji => ji.Expert)
                .WithMany(e => e.JobInterests)
                .HasForeignKey(ji => ji.ExpertId)
                .OnDelete(DeleteBehavior.Restrict);

            // 8. Favorite Consultants 
            modelBuilder.Entity<FavoriteConsultant>()
                .HasOne(fc => fc.User)
                .WithMany(u => u.FavoriteConsultants)
                .HasForeignKey(fc => fc.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FavoriteConsultant>()
                .HasOne(fc => fc.Expert)
                .WithMany(e => e.FavoritedBy)
                .HasForeignKey(fc => fc.ExpertId)
                .OnDelete(DeleteBehavior.Restrict);

            // 9. Reviews 
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Reviewer)
                .WithMany(u => u.ReviewsGiven)
                .HasForeignKey(r => r.ReviewerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Expert)
                .WithMany(e => e.Reviews)
                .HasForeignKey(r => r.ExpertId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Booking)
                .WithMany(b => b.Reviews)
                .HasForeignKey(r => r.BookingId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}