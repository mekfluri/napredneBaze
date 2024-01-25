using napredneBaze.Chat.Room;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SignalRSwaggerGen.Attributes;
using StackExchange.Redis;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;


namespace napredneBaze.Chat.ChatHub
{
    [SignalRHub]

    public class ChatHub : Hub
    {


        private readonly RedisSubscriber _subscriber;
        private readonly RedisPublisher _redisPublisher;
        private readonly IConnectionMultiplexer _redis;
        private readonly IDatabase _redisDatabase;

        public ChatHub(IConnectionMultiplexer redis)
        {


            _redis = redis;
            _redisDatabase = _redis.GetDatabase();
            _subscriber = new RedisSubscriber(_redis);
            _redisPublisher = new RedisPublisher();
        }


        public ChatHub()
        {

        }
        public async Task Subscribe(string channel)
        {
            try
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, channel);

                _subscriber.Subscribe(channel, async (c, m) => {
                    try
                    {
                        Console.WriteLine($"Primljena poruka na kanalu {channel}: {m}");
                        //ovaj klijent zeza

                        
                        await Clients.Group(channel).SendAsync("message", m);
                    }
                    catch (Exception ex)
                    {
                        Console.Error.WriteLine($"Greška pri slanju poruke na klijentsku stranu: {ex.Message}");
                    }
                });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Greška pri dodavanju u grupu: {ex.Message}");
            }
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
        
        public async Task SendMessage(RoomMessage message, string roomName)
        {
            try
            {

               await Clients.Group(roomName).SendAsync("message", message);
               string poruka = message.Message;

                _redisPublisher.Publish(roomName, poruka);
                await  _redisDatabase.SortedSetAddAsync(roomName, JsonConvert.SerializeObject(message),1 );

           

            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error in SendMessage: {ex.Message}");
            }
        }



    }
}
