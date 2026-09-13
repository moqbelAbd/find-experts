using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FindExpertsBackend.Migrations
{
    /// <inheritdoc />
    public partial class Post_filed_optional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Posts_Fields_FieldId",
                table: "Posts");

            migrationBuilder.AlterColumn<int>(
                name: "FieldId",
                table: "Posts",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_Posts_Fields_FieldId",
                table: "Posts",
                column: "FieldId",
                principalTable: "Fields",
                principalColumn: "FieldId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Posts_Fields_FieldId",
                table: "Posts");

            migrationBuilder.AlterColumn<int>(
                name: "FieldId",
                table: "Posts",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Posts_Fields_FieldId",
                table: "Posts",
                column: "FieldId",
                principalTable: "Fields",
                principalColumn: "FieldId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
