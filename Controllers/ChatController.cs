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
        [Route("createRoom")]
        [HttpPost]
        public async Task<IActionResult> CreateRoom([FromBody] CreateRoomRequest request)
        {
            var roomId = await _service.CreateRoom(request.User1, request.RoomName); // Pass the roomName
            if (roomId != null)
            {
                return Ok(new { RoomId = roomId });
            }
            else
            {
                return BadRequest("Room creation failed"); // or handle failure as needed
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