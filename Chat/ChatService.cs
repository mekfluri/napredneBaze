using Newtonsoft.Json;
using StackExchange.Redis;
using static napredneBaze.Chat.Room.Room;
using napredneBaze.Chat.Room;

using Microsoft.AspNetCore.Mvc;

namespace napredneBaze.Chat.ChatService
{
public class ChatService
    {

        private readonly IConnectionMultiplexer _redis;
        private IDatabase _database;

        public ChatService(IConnectionMultiplexer redis)
        {
            _redis = redis;
            _database = _redis.GetDatabase();
        }



        public async Task<List<RoomMessage>> GetMessages(string room, int offset = 0, int size = 50)//(string roomId = "0", int offset = 0, int size = 50)
        {



            //var roomKey = $"room:{pubId}:{subId}";
            var roomExists = await _database.KeyExistsAsync(room);
            var messages = new List<RoomMessage>();

            if (!roomExists)
            {
                return messages;
            }
            else
            {
                var values = await _database.SortedSetRangeByRankAsync(room, offset, offset + size, Order.Ascending);

                foreach (var valueRedisVal in values)
                {
                    var value = valueRedisVal.ToString();
                    try
                    {
                        messages.Add(JsonConvert.DeserializeObject<RoomMessage>(value));
                    }
                    catch (System.Text.Json.JsonException)
                    {
                        // Console.WriteLine($"Couldn't deserialize json: {value}");
                    }
                }
                return messages;
            }
        }
        public async Task<string> CreateRoom(string creatorUser, string roomName)
        {
            var roomId = $"{creatorUser}";

            var roomExists = await _database.KeyExistsAsync($"room:{roomId}:name");

            if (!roomExists)
            {
                await _database.StringSetAsync($"room:{roomId}:name", roomName);
                await _database.SetAddAsync($"user:{creatorUser}:rooms", roomId);
                await _database.SetAddAsync("allRooms", roomId);

                return roomId;
            }
            else
            {
                return null;
            }
        }



        public async Task<List<ChatRoom>> GetAllRooms()
        {
            var roomIds = await _database.SetMembersAsync("allRooms");
            var rooms = new List<ChatRoom>();

            foreach (var roomIdRedisValue in roomIds)
            {
                var roomId = roomIdRedisValue.ToString();
                var roomName = await _database.StringGetAsync($"room:{roomId}:name");

                if (roomName.IsNullOrEmpty)
                {
                    // It's a room without a name, likely the one with private messages
                    var roomExists = await _database.KeyExistsAsync($"room:{roomId}");

                    if (!roomExists)
                    {
                        continue;
                    }

                    var userIds = roomId.Split(':');
                    if (userIds.Length != 2)
                    {
                        throw new Exception("You don't have access to this room");
                    }

                    rooms.Add(new ChatRoom()
                    {
                        Id = roomId,
                        RoomName = string.Empty,
                        Names = new List<string>() {
                    (await _database.HashGetAsync($"user:{userIds[0]}", "username")).ToString(),
                    (await _database.HashGetAsync($"user:{userIds[1]}", "username")).ToString(),
                }
                    });
                }
                else
                {
                    rooms.Add(new ChatRoom()
                    {
                        Id = roomId,
                        RoomName = roomName.ToString(), // Set the RoomName
                        Names = new List<string>() {
                    roomName.ToString()
                }
                    });
                }
            }

            return rooms;
        }



        public async Task SendMessage(string room, RoomMessage message)
        {
            var roomKey = room;

            await _database.SortedSetAddAsync(roomKey, JsonConvert.SerializeObject(message), (double)message.Date);

        }

        public async Task DeleteRoom(string roomId)
        {
            await _database.KeyDeleteAsync($"room:{roomId}:name");

            await _database.SetRemoveAsync("allRooms", roomId);

        }


    }
}
public class CreateRoomRequest
{
    public string User1 { get; set; }
    public string RoomName { get; set; }
}