using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FindExpertsBackend.Migrations
{
    /// <inheritdoc />
    public partial class ExpertProfile_and_Skill_update : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExpertSkills_Skills_SkillId",
                table: "ExpertSkills");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ExpertSkills",
                table: "ExpertSkills");

            migrationBuilder.AlterColumn<int>(
                name: "SkillId",
                table: "ExpertSkills",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "ExpertSkills",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "SkillName",
                table: "ExpertSkills",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "GithubUrl",
                table: "ExpertProfiles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LinkedInUrl",
                table: "ExpertProfiles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PortfolioUrl",
                table: "ExpertProfiles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ExpertSkills",
                table: "ExpertSkills",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_ExpertSkills_ExpertId",
                table: "ExpertSkills",
                column: "ExpertId");

            migrationBuilder.AddForeignKey(
                name: "FK_ExpertSkills_Skills_SkillId",
                table: "ExpertSkills",
                column: "SkillId",
                principalTable: "Skills",
                principalColumn: "SkillId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExpertSkills_Skills_SkillId",
                table: "ExpertSkills");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ExpertSkills",
                table: "ExpertSkills");

            migrationBuilder.DropIndex(
                name: "IX_ExpertSkills_ExpertId",
                table: "ExpertSkills");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "ExpertSkills");

            migrationBuilder.DropColumn(
                name: "SkillName",
                table: "ExpertSkills");

            migrationBuilder.DropColumn(
                name: "GithubUrl",
                table: "ExpertProfiles");

            migrationBuilder.DropColumn(
                name: "LinkedInUrl",
                table: "ExpertProfiles");

            migrationBuilder.DropColumn(
                name: "PortfolioUrl",
                table: "ExpertProfiles");

            migrationBuilder.AlterColumn<int>(
                name: "SkillId",
                table: "ExpertSkills",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ExpertSkills",
                table: "ExpertSkills",
                columns: new[] { "ExpertId", "SkillId" });

            migrationBuilder.AddForeignKey(
                name: "FK_ExpertSkills_Skills_SkillId",
                table: "ExpertSkills",
                column: "SkillId",
                principalTable: "Skills",
                principalColumn: "SkillId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
