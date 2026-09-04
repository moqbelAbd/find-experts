using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FindExpertsBackend.Data;
using FindExpertsBackend.DTOs;
using FindExpertsBackend.Models; // Adjust to your models namespace
using System.Security.Claims;
using System.Globalization;

namespace FindExpertsBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ExpertProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ExpertProfileController(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpPost]
        public async Task<IActionResult> CreateExpertProfile([FromForm] CreateExpertProfileDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized(ApiResponse<string>.FailureResult("Invalid user token."));

            // 1. Check if user already has an expert profile
            var existingProfile = await _context.ExpertProfiles.FirstOrDefaultAsync(ep => ep.UserId == userId);
            if (existingProfile != null)
                return BadRequest(ApiResponse<string>.FailureResult("User is already an expert."));

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 2. Create the main Expert Profile
                var expertProfile = new ExpertProfile
                {
                    UserId = userId,
                    JobTitle = dto.JobTitle,
                    FieldId = dto.FieldId,
                    Bio = dto.Bio,
                    LinkedInUrl = dto.LinkedInUrl, 
                    GithubUrl = dto.GithubUrl,     
                    PortfolioUrl = dto.PortfolioUrl,
                    TotalExperienceYears = dto.TotalExperienceYears,
                    ConsultationEnabled = dto.ConsultationEnabled,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.ExpertProfiles.Add(expertProfile);
                await _context.SaveChangesAsync(); // Save to generate the ExpertProfileId

                // 3. Process Skills (Find existing or create new ones)
                foreach (var skillName in dto.Skills.Distinct())
                {
                    var normalizedName = skillName.Trim().ToLower();

                    _context.ExpertSkills.Add(new ExpertSkill
                    {
                        ExpertId = expertProfile.ExpertProfileId,
                        SkillName = CultureInfo.CurrentCulture.TextInfo.ToTitleCase(normalizedName)
                    });
                }

                // 4. Process Experiences
                foreach (var exp in dto.Experiences.Where(e => !string.IsNullOrEmpty(e.JobTitle)))
                {
                    _context.Experiences.Add(new Experience
                    {
                        ExpertId = expertProfile.ExpertProfileId,
                        JobTitle = exp.JobTitle,
                        CompanyName = exp.CompanyName,
                        StartDate = exp.From, 
                        EndDate = exp.To
                    });
                }

                // 5. Process Certificates
                foreach (var cert in dto.Certificates.Where(c => !string.IsNullOrEmpty(c.CertificateName)))
                {
                    _context.Certificates.Add(new Certificate
                    {
                        ExpertId = expertProfile.ExpertProfileId,
                        CertificateName = cert.CertificateName,
                        Issuer = cert.Issuer,
                        IssueDate = cert.IssueDate
                    });
                }

                // 6. Process Projects & File Uploads
                var webRootPath = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
                var projectsFolder = Path.Combine(webRootPath, "uploads", "projects");
                if (!Directory.Exists(projectsFolder)) Directory.CreateDirectory(projectsFolder);

                var requestScheme = HttpContext.Request.Scheme;
                var requestHost = HttpContext.Request.Host;

                foreach (var proj in dto.Projects.Where(p => !string.IsNullOrEmpty(p.ProjectTitle)))
                {
                    string imageUrl = null;

                    if (proj.ImageFile != null && proj.ImageFile.Length > 0)
                    {
                        var ext = Path.GetExtension(proj.ImageFile.FileName);
                        var fileName = $"{expertProfile.ExpertProfileId}_{Guid.NewGuid()}{ext}";
                        var filePath = Path.Combine(projectsFolder, fileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await proj.ImageFile.CopyToAsync(stream);
                        }
                        imageUrl = $"{requestScheme}://{requestHost}/uploads/projects/{fileName}";
                    }

                    _context.Projects.Add(new Project
                    {
                        ExpertId = expertProfile.ExpertProfileId,
                        ProjectTitle = proj.ProjectTitle,
                        ProjectDescription = proj.ProjectDescription,
                        ProjectUrl = proj.ProjectUrl,
                        ProjectImage = imageUrl
                    });
                }

                // 7. Process Consultation Setup
                if (dto.ConsultationEnabled)
                {
                    foreach (var avail in dto.Availabilities)
                    {
                        _context.ExpertAvailabilities.Add(new ExpertAvailability
                        {
                            ExpertId = expertProfile.ExpertProfileId,
                            DayOfWeek = avail.DayOfWeek,
                            StartTime = avail.StartTime,
                            EndTime = avail.EndTime,
                            IsAvailable = true
                        });
                    }

                    foreach (var pkg in dto.Packages)
                    {
                        _context.ConsultationPackages.Add(new ConsultationPackage
                        {
                            ExpertId = expertProfile.ExpertProfileId,
                            Duration = pkg.Duration,
                            Price = pkg.Price
                        });
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(ApiResponse<Guid>.SuccessResult(expertProfile.ExpertProfileId, "Expert profile created successfully."));
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, ApiResponse<string>.FailureResult("An error occurred while saving the profile.", new List<string> { ex.Message }));
            }
        }
    }
}