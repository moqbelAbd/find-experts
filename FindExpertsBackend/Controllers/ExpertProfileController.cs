using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FindExpertsBackend.Data;
using FindExpertsBackend.DTOs;
using FindExpertsBackend.Models; 
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

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetExpertsProfiles()
        {
            var profiles = await _context.ExpertProfiles
                .Include(ep => ep.User)
                .Include(ep => ep.Field)
                .Include(ep => ep.ExpertSkills)
                .Include(ep => ep.Experiences)
                .Include(ep => ep.Certificates)
                .Include(ep => ep.Projects)
                .Include(ep => ep.ConsultationPackages)
                .Include(ep => ep.ExpertAvailabilities)
                  .AsSplitQuery()
                   .ToListAsync();

            var response = new List<ExpertProfileResponseDto>();

            foreach (var item in profiles)
            {
                response.Add(new ExpertProfileResponseDto
                {
                    ExpertProfileId = item.ExpertProfileId,
                    UserId = item.UserId,
                    FullName = item.User?.FullName?.Trim() ?? item.User?.UserName?.Split('@')[0] ?? "Unknown User",
                    ProfilePicture = item.User?.Avatar,
                    JobTitle = item.JobTitle,
                    FieldId = item.FieldId,
                    FieldName = item.Field?.FieldName ?? "Unknown Field",
                    Bio = item.Bio,
                    TotalExperienceYears = item.TotalExperienceYears,
                    ConsultationEnabled = item.ConsultationEnabled,
                    LinkedInUrl = item.LinkedInUrl,
                    GithubUrl = item.GithubUrl,
                    PortfolioUrl = item.PortfolioUrl,

                    Skills = item.ExpertSkills.Select(s => s.SkillName).ToList(),

                    Experiences = item.Experiences.Select(e => new ExperienceResponseDto
                    {
                        JobTitle = e.JobTitle,
                        CompanyName = e.CompanyName,
                        StartDate = e.StartDate,
                        EndDate = e.EndDate
                    }).ToList(),

                    Certificates = item.Certificates.Select(c => new CertificateResponseDto
                    {
                        CertificateName = c.CertificateName,
                        Issuer = c.Issuer,
                        IssueDate = c.IssueDate
                    }).ToList(),

                    Projects = item.Projects.Select(p => new ProjectResponseDto
                    {
                        ProjectTitle = p.ProjectTitle,
                        ProjectDescription = p.ProjectDescription,
                        ProjectUrl = p.ProjectUrl,
                        ProjectImage = p.ProjectImage
                    }).ToList(),

                    Availabilities = item.ExpertAvailabilities.Select(a => new AvailabilityResponseDto
                    {
                        DayOfWeek = a.DayOfWeek,
                        StartTime = a.StartTime,
                        EndTime = a.EndTime
                    }).ToList(),

                    Packages = item.ConsultationPackages.Select(p => new PackageResponseDto
                    {
                        Duration = p.Duration,
                        Price = p.Price
                    }).ToList()
                }

            );
            }

            return Ok(ApiResponse<List<ExpertProfileResponseDto>>.SuccessResult(response));
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
                return BadRequest(ApiResponse<string>.FailureResult("User is already has expert profile."));

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

        [HttpGet("{expertProfileId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetExpertProfile(Guid expertProfileId)
        {
            var profile = await _context.ExpertProfiles
                .Include(ep => ep.User)
                .Include(ep => ep.Field)
                .Include(ep => ep.ExpertSkills) 
                .Include(ep => ep.Experiences)
                .Include(ep => ep.Certificates)
                .Include(ep => ep.Projects)
                .Include(ep => ep.ConsultationPackages)
                .Include(ep => ep.ExpertAvailabilities)
                .FirstOrDefaultAsync(ep => ep.ExpertProfileId == expertProfileId);

            if (profile == null)
                return NotFound(ApiResponse<string>.FailureResult("Expert profile not found."));

            var response = new ExpertProfileResponseDto
            {
                ExpertProfileId = profile.ExpertProfileId,
                UserId = profile.UserId,
                FullName = profile.User?.FullName.Trim(),
                ProfilePicture = profile.User?.Avatar,
                JobTitle = profile.JobTitle,
                FieldId = profile.FieldId,
                FieldName = profile.Field?.FieldName ?? "Unknown Field",
                Bio = profile.Bio,
                TotalExperienceYears = profile.TotalExperienceYears,
                ConsultationEnabled = profile.ConsultationEnabled,
                LinkedInUrl = profile.LinkedInUrl,
                GithubUrl = profile.GithubUrl,
                PortfolioUrl = profile.PortfolioUrl,

                Skills = profile.ExpertSkills.Select(s => s.SkillName).ToList(),

                Experiences = profile.Experiences.Select(e => new ExperienceResponseDto
                {
                    JobTitle = e.JobTitle,
                    CompanyName = e.CompanyName,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate
                }).ToList(),

                Certificates = profile.Certificates.Select(c => new CertificateResponseDto
                {
                    CertificateName = c.CertificateName,
                    Issuer = c.Issuer,
                    IssueDate = c.IssueDate
                }).ToList(),

                Projects = profile.Projects.Select(p => new ProjectResponseDto
                {
                    ProjectTitle = p.ProjectTitle,
                    ProjectDescription = p.ProjectDescription,
                    ProjectUrl = p.ProjectUrl,
                    ProjectImage = p.ProjectImage
                }).ToList(),

                Availabilities = profile.ExpertAvailabilities.Select(a => new AvailabilityResponseDto
                {
                    DayOfWeek = a.DayOfWeek,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime
                }).ToList(),

                Packages = profile.ConsultationPackages.Select(p => new PackageResponseDto
                {
                    Duration = p.Duration,
                    Price = p.Price
                }).ToList()
            };

            return Ok(ApiResponse<ExpertProfileResponseDto>.SuccessResult(response));
        }

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateExpertProfile([FromForm] CreateExpertProfileDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized(ApiResponse<string>.FailureResult("Invalid user token."));

            // 1. Fetch the existing profile and eagerly load ALL related lists
            var profile = await _context.ExpertProfiles
                .Include(ep => ep.ExpertSkills)
                .Include(ep => ep.Experiences)
                .Include(ep => ep.Certificates)
                .Include(ep => ep.Projects)
                .Include(ep => ep.ExpertAvailabilities)
                .Include(ep => ep.ConsultationPackages)
                .FirstOrDefaultAsync(ep => ep.UserId == userId);

            if (profile == null)
                return NotFound(ApiResponse<string>.FailureResult("Expert profile not found."));

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 2. Update scalar properties
                profile.JobTitle = dto.JobTitle;
                profile.FieldId = dto.FieldId;
                profile.Bio = dto.Bio;
                profile.LinkedInUrl = dto.LinkedInUrl;
                profile.GithubUrl = dto.GithubUrl;
                profile.PortfolioUrl = dto.PortfolioUrl;
                profile.TotalExperienceYears = dto.TotalExperienceYears;
                profile.ConsultationEnabled = dto.ConsultationEnabled;
                profile.UpdatedAt = DateTime.UtcNow;

                // 3. Clear all old nested collections
                _context.ExpertSkills.RemoveRange(profile.ExpertSkills);
                _context.Experiences.RemoveRange(profile.Experiences);
                _context.Certificates.RemoveRange(profile.Certificates);
                _context.Projects.RemoveRange(profile.Projects);
                _context.ExpertAvailabilities.RemoveRange(profile.ExpertAvailabilities);
                _context.ConsultationPackages.RemoveRange(profile.ConsultationPackages);

                // 4. Re-add Skills
                foreach (var skillName in dto.Skills.Distinct())
                {
                    if (!string.IsNullOrWhiteSpace(skillName))
                    {
                        _context.ExpertSkills.Add(new ExpertSkill { ExpertId = profile.ExpertProfileId, SkillName = skillName.Trim() });
                    }
                }

                // 5. Re-add Experiences
                foreach (var exp in dto.Experiences.Where(e => !string.IsNullOrEmpty(e.JobTitle)))
                {
                    _context.Experiences.Add(new Experience
                    {
                        ExpertId = profile.ExpertProfileId,
                        JobTitle = exp.JobTitle,
                        CompanyName = exp.CompanyName,
                        StartDate = exp.From,
                        EndDate = exp.To
                    });
                }

                // 6. Re-add Certificates
                foreach (var cert in dto.Certificates.Where(c => !string.IsNullOrEmpty(c.CertificateName)))
                {
                    _context.Certificates.Add(new Certificate
                    {
                        ExpertId = profile.ExpertProfileId,
                        CertificateName = cert.CertificateName,
                        Issuer = cert.Issuer,
                        IssueDate = cert.IssueDate
                    });
                }

                // 7. Re-add Projects (Handling Images)
                var webRootPath = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
                var projectsFolder = Path.Combine(webRootPath, "uploads", "projects");
                if (!Directory.Exists(projectsFolder)) Directory.CreateDirectory(projectsFolder);

                foreach (var proj in dto.Projects.Where(p => !string.IsNullOrEmpty(p.ProjectTitle)))
                {
                    string imageUrl = proj.ExistingImageUrl; // Start with the old image

                    // If a new file was uploaded, overwrite the old image
                    if (proj.ImageFile != null && proj.ImageFile.Length > 0)
                    {
                        var ext = Path.GetExtension(proj.ImageFile.FileName);
                        var fileName = $"{profile.ExpertProfileId}_{Guid.NewGuid()}{ext}";
                        var filePath = Path.Combine(projectsFolder, fileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await proj.ImageFile.CopyToAsync(stream);
                        }
                        imageUrl = $"{HttpContext.Request.Scheme}://{HttpContext.Request.Host}/uploads/projects/{fileName}";
                    }

                    _context.Projects.Add(new Project
                    {
                        ExpertId = profile.ExpertProfileId,
                        ProjectTitle = proj.ProjectTitle,
                        ProjectDescription = proj.ProjectDescription,
                        ProjectUrl = proj.ProjectUrl,
                        ProjectImage = imageUrl
                    });
                }

                // 8. Re-add Consultation Setup
                if (dto.ConsultationEnabled)
                {
                    foreach (var avail in dto.Availabilities)
                    {
                        _context.ExpertAvailabilities.Add(new ExpertAvailability
                        {
                            ExpertId = profile.ExpertProfileId,
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
                            ExpertId = profile.ExpertProfileId,
                            Duration = pkg.Duration,
                            Price = pkg.Price
                        });
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(ApiResponse<Guid>.SuccessResult(profile.ExpertProfileId, "Expert profile updated successfully."));
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, ApiResponse<string>.FailureResult("An error occurred while updating the profile.", new List<string> { ex.Message }));
            }
        }

       
    }
}