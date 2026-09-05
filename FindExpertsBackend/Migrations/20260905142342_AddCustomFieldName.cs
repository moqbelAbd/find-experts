using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FindExpertsBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomFieldName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExpertProfiles_Fields_FieldId",
                table: "ExpertProfiles");

            migrationBuilder.AlterColumn<int>(
                name: "FieldId",
                table: "ExpertProfiles",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<string>(
                name: "FieldName",
                table: "ExpertProfiles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_ExpertProfiles_Fields_FieldId",
                table: "ExpertProfiles",
                column: "FieldId",
                principalTable: "Fields",
                principalColumn: "FieldId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExpertProfiles_Fields_FieldId",
                table: "ExpertProfiles");

            migrationBuilder.DropColumn(
                name: "FieldName",
                table: "ExpertProfiles");

            migrationBuilder.AlterColumn<int>(
                name: "FieldId",
                table: "ExpertProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ExpertProfiles_Fields_FieldId",
                table: "ExpertProfiles",
                column: "FieldId",
                principalTable: "Fields",
                principalColumn: "FieldId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
