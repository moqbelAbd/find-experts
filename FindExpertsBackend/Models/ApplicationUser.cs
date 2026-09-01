using Microsoft.AspNetCore.Identity;

namespace FindExpertsBackend.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string? FullName { get; set; }
    }
}
