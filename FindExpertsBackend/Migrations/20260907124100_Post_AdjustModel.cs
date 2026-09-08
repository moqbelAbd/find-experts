using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FindExpertsBackend.Migrations
{
    /// <inheritdoc />
    public partial class Post_AdjustModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ServiceDetails",
                table: "ServicePosts");

            migrationBuilder.AddColumn<int>(
                name: "ServiceBudget",
                table: "ServicePosts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "Solved",
                table: "Posts",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ServiceBudget",
                table: "ServicePosts");

            migrationBuilder.DropColumn(
                name: "Solved",
                table: "Posts");

            migrationBuilder.AddColumn<string>(
                name: "ServiceDetails",
                table: "ServicePosts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
