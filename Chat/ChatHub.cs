using napredneBaze.Chat.Room;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SignalRSwaggerGen.Attributes;
using StackExchange.Redis;

namespace napredneBaze.Chat.ChatHub
{
    [SignalRHub]

    public class ChatHub : Hub
    {


        private readonly RedisSubscriber _subscriber;
        private readonly IConnectionMultiplexer _redis;
        private readonly IDatabase _redisDatabase;

        public ChatHub(IConnectionMultiplexer redis)
        {


            _redis = redis;
            _redisDatabase = _redis.GetDatabase();
            _subscriber = new RedisSubscriber(_redis);
        }


        public ChatHub()
        {

        }
        public async Task Subscribe(string channel)
        {
            //dodajemo trenutnu signalir vezu i kanal 
            await Groups.AddToGroupAsync(Context.ConnectionId, channel);
            //kada stigne poruka na tom kanalu izvrsice se funkcija koja je prosledjna kao parametar
            _subscriber.Subscribe(channel, (c, m) => Clients.Group(channel).SendAsync("message", m));
        }

        public async Task Unsubscribe(string channel)
        {
            _subscriber.Unsubscribe(channel);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, channel);
        }

        public async Task JoinRoom(string roomName)
        {
            Console.WriteLine($"ConnectionId: {Context.ConnectionId}, RoomName: {roomName}");
            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
        }

        public async Task SubscribeRoom(string roomName)
        {
            _subscriber.Subscribe(roomName, (c, m) => Clients.Group(roomName).SendAsync("message", m));
        }


        /*public async Task SendMessage(string message, string roomName)
        {
            await Clients.Group(roomName).SendAsync("message", message);
        }
*/
        public async Task SendMessage(string message, string roomName)
        {
            try
            {
                //Console.WriteLine(Clients.Group(roomName));

                await Clients.Group(roomName).SendAsync("message", message);
                //redisDatabase = redis.GetDatabase();
                Console.WriteLine("cao");
                string key = $"{roomName}";
                bool success = _redisDatabase.StringSet(key, message);

                if (success)
                {
                    Console.WriteLine($"Poruka uspešno sačuvana u Redis-u za sobu: {roomName}");
                }
                else
                {
                    Console.Error.WriteLine($"Greška prilikom čuvanja poruke u Redis-u za sobu: {roomName}");
                }

            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error in SendMessage: {ex.Message}");
            }
        }



    }
}
