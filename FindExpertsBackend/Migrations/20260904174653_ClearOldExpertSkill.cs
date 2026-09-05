using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FindExpertsBackend.Migrations
{
    /// <inheritdoc />
    public partial class ClearOldExpertSkill : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.CreateTable(
                    name: "ExpertSkills",
                    columns: table => new
                    {
                        ExpertSkillId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                        ExpertId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                        SkillName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                    },
                    constraints: table =>
                    {
                        table.PrimaryKey("PK_ExpertSkills", x => x.ExpertSkillId);
                        table.ForeignKey(
                            name: "FK_ExpertSkills_ExpertProfiles_ExpertId",
                            column: x => x.ExpertId,
                            principalTable: "ExpertProfiles",
                            principalColumn: "ExpertProfileId",
                            onDelete: ReferentialAction.Cascade);
                    });

            migrationBuilder.CreateIndex(
                name: "IX_ExpertSkills_ExpertId",
                table: "ExpertSkills",
                column: "ExpertId");
        }
        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
