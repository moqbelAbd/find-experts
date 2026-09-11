namespace FindExpertsBackend.DTOs
{
    public class BookingInformationDto
    {
        public class BookingSetupDto
        {
            public Guid ExpertId { get; set; }
            public string FullName { get; set; }
            public string JobTitle { get; set; }
            public string Avatar { get; set; }
            public double Rating { get; set; }
            public int ReviewsCount { get; set; }
            public int Guarantees { get; set; }
            public List<BookingPackageDto> Packages { get; set; } = new();
            public List<ExpertScheduleDto> Schedule { get; set; } = new();
            public List<ReviewDto> Reviews { get; set; } = new();
            public List<BookedSlotDto> BookedSlots { get; set; } = new();
        }

        public class BookingPackageDto
        {
            public int Duration { get; set; }
            public decimal Price { get; set; }
        }

        public class ExpertScheduleDto
        {
            public int DayOfWeek { get; set; } 
            public string StartTime { get; set; } 
            public string EndTime { get; set; }   
        }

        public class BookedSlotDto
        {
            public DateTime Start { get; set; }
            public int Duration { get; set; }
        }

        public class ReviewDto
        {
            public Guid ReviewId { get; set; }
            public string ReviewerName { get; set; }
            public string ReviewerAvatar { get; set; }
            public int Rating { get; set; }
            public string Comment { get; set; }
            public DateTime CreatedAt { get; set; }
        }
    }
}
