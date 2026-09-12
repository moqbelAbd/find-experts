namespace FindExpertsBackend.DTOs
{
    public class AdminOverviewDto
    {
        // Top Cards
        public StatCardDto TotalUsers { get; set; }
        public StatCardDto ActiveExperts { get; set; }
        public StatCardDto TotalBookings { get; set; }
        public StatCardDto TotalRevenue { get; set; }
        public StatCardDto OpenPosts { get; set; }

        // Charts
        public List<MonthlyStatDto> MonthlyBookings { get; set; } = new();
        public GuaranteeStatsDto ExpertGuarantees { get; set; }
    }

    public class StatCardDto
    {
        public decimal Value { get; set; }
        public double GrowthPercentage { get; set; } // + or - % vs last month
    }

    public class MonthlyStatDto
    {
        public string Month { get; set; }
        public int Total { get; set; }
    }

    public class GuaranteeStatsDto
    {
        public int GreenCount { get; set; }
        public int BronzeCount { get; set; }
        public int SilverCount { get; set; }
        public int GoldCount { get; set; }
        public int TotalGuarantees { get; set; }
    }
}
