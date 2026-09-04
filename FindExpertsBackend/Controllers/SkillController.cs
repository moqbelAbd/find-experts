using FindExpertsBackend.Data;
using FindExpertsBackend.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FindExpertsBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SkillController : ControllerBase
    {
        ApplicationDbContext _context;

       public SkillController (ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetSkills()
        {
            var skills = await _context.Skills
                .Select(s => new { s.SkillId, s.SkillName })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResult(skills) );
        }

        [HttpGet ("by-field/{fieldID}")]
        public async Task<IActionResult> GetSkillsByField(int fieldID)
        {
            var skillsByField = await _context.Skills
                .Where(s => s.FieldId == fieldID)
                .Select( s => new {s.SkillId, s.SkillName})
                .ToListAsync();

            return Ok(ApiResponse<Object>.SuccessResult(skillsByField));
        }
    }
}
