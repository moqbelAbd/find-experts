using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FindExpertsBackend.Models
{
    public class ServicePost
    {
        [Key]
        public Guid PostId { get; set; }

        public int ServiceBudget { get; set; }

        // Navigation Properties
        [ForeignKey(nameof(PostId))]
        public virtual Post Post { get; set; }
    }
}
