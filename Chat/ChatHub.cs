using napredneBaze.Chat.Room;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SignalRSwaggerGen.Attributes;
using StackExchange.Redis;

namespace napredneBaze.Chat
{
    [SignalRHub]

    public class Chat : Hub
    {
    

        private readonly RedisSubscriber _subscriber;
        private readonly IConnectionMultiplexer redis;
        private readonly IDatabase redisDatabase;

        public Chat(IConnectionMultiplexer redis)
        {

            _subscriber = new RedisSubscriber(redis);
        }


        public Chat()
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
            await Clients.Group(roomName).SendAsync("message", message);
            IDatabase db = redis.GetDatabase();
            string key = $"{roomName}";
            bool success = db.StringSet(key, message);

        }



    }
}
