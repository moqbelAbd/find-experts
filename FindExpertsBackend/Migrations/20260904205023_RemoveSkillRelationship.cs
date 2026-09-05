using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FindExpertsBackend.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSkillRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ConsultationPackages_ExpertId",
                table: "ConsultationPackages");

            migrationBuilder.AddColumn<int>(
                name: "SkillId",
                table: "ExpertSkills",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ConsultationPackages_ExpertId",
                table: "ConsultationPackages",
                column: "ExpertId",
                unique: false);

            migrationBuilder.AddForeignKey(
                name: "FK_ExpertSkills_Skills_SkillId",
                table: "ExpertSkills",
                column: "SkillId",
                principalTable: "Skills",
                principalColumn: "SkillId");
        }
    }
}
