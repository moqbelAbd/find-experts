using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FindExpertsBackend.Migrations
{
    /// <inheritdoc />
    public partial class FixConsultationPackageIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
        name: "IX_ConsultationPackages_ExpertId",
        table: "ConsultationPackages");

            // 2. Recreate it as a normal (non-unique) index
            migrationBuilder.CreateIndex(
                name: "IX_ConsultationPackages_ExpertId",
                table: "ConsultationPackages",
                column: "ExpertId",
                unique: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
