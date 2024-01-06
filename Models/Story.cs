namespace napredneBaze.Models;

    public class Story
    {
        public Guid Id { get; set; }

        public string Creator { get; set; }
   
        public string Url { get; set; } = string.Empty;

        public DateTime DateTimeCreated { get; set; }

        public int NumLikes { get; set; }
    }

