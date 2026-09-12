using FindExpertsBackend.Data;
using FindExpertsBackend.DTOs;
using FindExpertsBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;


namespace FindExpertsBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MessageController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MessageController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid currentUserId)) return Unauthorized();

            var messages = await _context.Messages
                .Where(m => (m.SenderId == currentUserId || m.ReceiverId == currentUserId) && !m.IsDeleted)
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            var conversations = messages
                .GroupBy(m => m.SenderId == currentUserId ? m.ReceiverId : m.SenderId)
                .Select(g => {
                    var partner = g.First().SenderId == currentUserId ? g.First().Receiver : g.First().Sender;
                    var lastMsg = g.First();
                    return new ChatsDto
                    {
                        PartnerId = partner.Id,
                        PartnerName = partner.FullName ?? partner.UserName,
                        PartnerAvatar = partner.Avatar,
                        LastMessage = lastMsg.MessageContent,
                        LastMessageDate = lastMsg.CreatedAt,
                        UnreadCount = g.Count(m => m.ReceiverId == currentUserId && !m.IsRead)
                    };
                })
                .ToList();

            return Ok(ApiResponse<List<ChatsDto>>.SuccessResult(conversations));
        }

        [HttpGet("chat/{otherUserId}")]
        public async Task<IActionResult> GetChatHistory(Guid otherUserId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid currentUserId)) return Unauthorized();

            var messages = await _context.Messages
                .Where(m => !m.IsDeleted &&
                       ((m.SenderId == currentUserId && m.ReceiverId == otherUserId) ||
                        (m.SenderId == otherUserId && m.ReceiverId == currentUserId)))
                .OrderBy(m => m.CreatedAt)
                .Select(m => new MessageDto
                {
                    MessageId = m.MessageId,
                    SenderId = m.SenderId,
                    ReceiverId = m.ReceiverId,
                    MessageContent = m.MessageContent,
                    CreatedAt = m.CreatedAt,
                    IsRead = m.IsRead
                })
                .ToListAsync();

            // Mark incoming messages as read
            var unreadMessages = await _context.Messages
                .Where(m => m.SenderId == otherUserId && m.ReceiverId == currentUserId && !m.IsRead)
                .ToListAsync();

            foreach (var msg in unreadMessages)
            {
                msg.IsRead = true;
            }
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<List<MessageDto>>.SuccessResult(messages));
        }

        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid currentUserId)) return Unauthorized();

            var message = new Message
            {
                SenderId = currentUserId,
                ReceiverId = dto.ReceiverId,
                MessageContent = dto.MessageContent,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            var responseDto = new MessageDto
            {
                MessageId = message.MessageId,
                SenderId = message.SenderId,
                ReceiverId = message.ReceiverId,
                MessageContent = message.MessageContent,
                CreatedAt = message.CreatedAt,
                IsRead = message.IsRead
            };

            return Ok(ApiResponse<MessageDto>.SuccessResult(responseDto, "Message sent successfully"));
        }
    }
}
