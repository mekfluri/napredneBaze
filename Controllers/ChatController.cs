using napredneBaze.Chat.ChatService;
using napredneBaze.Chat.Room;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;

namespace napredneBaze.Controllers
{




    [ApiController]
    [Route("[controller]")]
    public class ChatController : ControllerBase
    {


        ChatService _service;
        IConnectionMultiplexer _mult;

        public ChatController(IConnectionMultiplexer redis)
        {
            _service = new ChatService(redis);
        }



        [Route("getMessages/{room}")]
        [HttpGet]
        public async Task<List<RoomMessage>> GetMessages(string room)
        {
            return await _service.GetMessages(room);
        }

        [Route("sendMessage/{room}")]
        [HttpPost]
        public async Task SendMessage(string room, [FromBody] RoomMessage message)
        {
            await _service.SendMessage(room, message);
        }
        [Route("createRoom/{userId}/{roomName}")]
        [HttpPost]
        public async Task<IActionResult> CreateRoom(string userId, string roomName)
        {
            try
            {
                var roomId = await _service.CreateRoom(userId, roomName);

                if (roomId != null)
                {
                    return Ok(new { RoomId = roomId });
                }
                else
                {
                    return BadRequest("Room creation failed");
                }
            }
            catch (Exception ex)
            {
               
                Console.WriteLine($"Greška prilikom stvaranja sobe: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
            }

        }

        [Route("getAllRooms")]
        [HttpGet]
        public async Task<IActionResult> GetAllRooms()
        {
            try
            {
                var rooms = await _service.GetAllRooms();
                return Ok(rooms);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }



    }
}