using System.ComponentModel.DataAnnotations;

namespace FindExpertsBackend.DTOs
{
    public class SendMessageDto
    {
        [Required]
        public Guid ReceiverId { get; set; }
        [Required]
        public string MessageContent { get; set; }
    }
}
