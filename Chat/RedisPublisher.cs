﻿using StackExchange.Redis;

namespace napredneBaze.Chat
{

    public class RedisPublisher
    {
        private readonly IDatabase _db;
        private readonly ConnectionMultiplexer _redis;

        public RedisPublisher()
        {
            _redis = ConnectionMultiplexer.Connect("localhost:6379");
            _db = _redis.GetDatabase();
        }

        public void Publish(string channel, string message)
        {
            Console.WriteLine("Poslato");
            Console.WriteLine(message);
            
            Console.WriteLine(channel);
            _db.Publish(channel, message);
        }
    }

}
