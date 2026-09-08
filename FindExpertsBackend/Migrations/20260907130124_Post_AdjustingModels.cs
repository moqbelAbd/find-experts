using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FindExpertsBackend.Migrations
{
    /// <inheritdoc />
    public partial class Post_AdjustingModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.CreateTable(
                name: "PostInterests",
                columns: table => new
                {
                    ServiceInterestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PostId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ExpertId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostInterests", x => x.ServiceInterestId);
                    table.ForeignKey(
                        name: "FK_PostInterests_ExpertProfiles_ExpertId",
                        column: x => x.ExpertId,
                        principalTable: "ExpertProfiles",
                        principalColumn: "ExpertProfileId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PostInterests_Posts_PostId",
                        column: x => x.PostId,
                        principalTable: "Posts",
                        principalColumn: "PostId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PostInterests_ExpertId",
                table: "PostInterests",
                column: "ExpertId");

            migrationBuilder.CreateIndex(
                name: "IX_PostInterests_PostId",
                table: "PostInterests",
                column: "PostId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PostInterests");

            migrationBuilder.CreateTable(
                name: "JobInterests",
                columns: table => new
                {
                    JobInterestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ExpertId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PostId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobInterests", x => x.JobInterestId);
                    table.ForeignKey(
                        name: "FK_JobInterests_ExpertProfiles_ExpertId",
                        column: x => x.ExpertId,
                        principalTable: "ExpertProfiles",
                        principalColumn: "ExpertProfileId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobInterests_Posts_PostId",
                        column: x => x.PostId,
                        principalTable: "Posts",
                        principalColumn: "PostId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServiceInterests",
                columns: table => new
                {
                    ServiceInterestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ExpertId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PostId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceInterests", x => x.ServiceInterestId);
                    table.ForeignKey(
                        name: "FK_ServiceInterests_ExpertProfiles_ExpertId",
                        column: x => x.ExpertId,
                        principalTable: "ExpertProfiles",
                        principalColumn: "ExpertProfileId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ServiceInterests_Posts_PostId",
                        column: x => x.PostId,
                        principalTable: "Posts",
                        principalColumn: "PostId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_JobInterests_ExpertId",
                table: "JobInterests",
                column: "ExpertId");

            migrationBuilder.CreateIndex(
                name: "IX_JobInterests_PostId",
                table: "JobInterests",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceInterests_ExpertId",
                table: "ServiceInterests",
                column: "ExpertId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceInterests_PostId",
                table: "ServiceInterests",
                column: "PostId");
        }
    }
}
