namespace FindExpertsBackend.DTOs
{
    public class UserProfileDto
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Avatar { get; set; }
        public string UserLocation { get; set; }
        public Guid? ExpertProfileId { get; set; }

    }

    public class UpdateLocationDto
    {

        public string UserLocation { get; set; }
    }

}
