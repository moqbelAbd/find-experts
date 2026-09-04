using FindExpertsBackend.Data;
using FindExpertsBackend.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FindExpertsBackend.Controllers
{
        [Route("api/[controller]")]
        [ApiController]
    public class FieldController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FieldController (ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetFields()
        {
            var fields = await _context.Fields
                .Select(f => new { f.FieldId, f.FieldName })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResult (fields) );
        }
    }
}
