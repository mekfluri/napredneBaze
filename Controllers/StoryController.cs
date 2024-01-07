namespace napredneBaze.Controllers;
using napredneBaze.Models;
using Microsoft.AspNetCore.Mvc;
using Neo4jClient;

[ApiController]
[Route("[controller]")]
public class StoryController : ControllerBase
{
    private readonly IGraphClient _client;

    public StoryController(IGraphClient client)
    {
        _client = client;
    }


    [Route("createStory/{userId}/{tekst}")]
    [HttpPost]
    public async Task<IActionResult> CreateStory(string userId, string tekst)
    {
        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest("Invalid userId");
        }

        // Retrieve story data from query string or route parameters
        string storyText = tekst; // Assuming story content is in the `tekst` route parameter

        // Validate story data (if applicable)
        if (string.IsNullOrEmpty(storyText))
        {
            return BadRequest("Story content is required");
        }

        // Create a Story object with the retrieved data
        Story story = new Story
        {
            Creator = userId,
            Url = storyText, // Assuming Url is intended for storyText
            Id = Guid.NewGuid(),
            DateTimeCreated = DateTime.Now
        };
        story.Creator = userId;
        story.Url = tekst;

        story.Id = Guid.NewGuid();
        story.DateTimeCreated = DateTime.Now;

        await _client.Cypher
            .Merge("(s:Story { Id: $storyId })")
            .OnCreate()
            .Set("s = $story")
            .WithParams(new { storyId = story.Id, story })
            .ExecuteWithoutResultsAsync();

        await _client.Cypher
            .Match("(usr:User)", "(s:Story)")
            .Where((User usr) => usr.Id == userId)
            .AndWhere((Story s) => s.Id == story.Id)
            .Merge("(usr)-[:Published]->(s)")
            .ExecuteWithoutResultsAsync();

        return Ok(new { success = true, message = "Story created successfully" });
    }



    [Route("deleteStory/{storyId}")]
    [HttpDelete]
    public async Task<IActionResult> DeleteStory(string storyId)
    {
        if (string.IsNullOrEmpty(storyId))
        {
            return BadRequest("Invalid storyId");
        }

        await _client.Cypher
            .Match("(:User)-[viewRel:Viewed]->(s:Story)")
            .Where((Story s) => s.Id.ToString() == storyId)
            .Delete("viewRel")
            .ExecuteWithoutResultsAsync();

        await _client.Cypher
            .Match("(usr:User)-[p:Published]->(str:Story)")
            .Where((Story str) => str.Id.ToString() == storyId)
            .Delete("p, str")
            .ExecuteWithoutResultsAsync();

        return Ok();
    }



    [Route("viewStory/{userId}/{storyId}")]
    [HttpPost]
    public async Task<IActionResult> ViewStory(string userId, string storyId)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(storyId))
        {
            return BadRequest("Invalid userId or storyId");
        }

        var query = _client.Cypher
            .Match("(usr:User)", "(s:Story)")
            .Where((User usr) => usr.Id == userId)
            .AndWhere((Story s) => s.Id.ToString() == storyId)
            .Create("(usr)-[:Viewed]->(s)");

        await query.ExecuteWithoutResultsAsync();

        return Ok();
    }



    [Route("getFriendsStories/{myId}")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Story>>> GetFriendsStories(string myId)
    {
        if (string.IsNullOrEmpty(myId))
        {
            return BadRequest("Invalid myId");
        }

        var followingsQuery = _client.Cypher
            .Match("(u:User)-[:Following]->(f:User)")
            .Where((User u) => u.Id == myId)
            .Return(f => f.As<User>().Id);

        var followings = await followingsQuery.ResultsAsync;

        var storiesQuery = _client.Cypher
            .Match("(u:User)-[:Published]->(s:Story)")
            .Where((User u) => followings.Contains(u.Id))
            .Return(s => s.As<Story>());

        var allStories = (await storiesQuery.ResultsAsync).ToList();

        // Fisher-Yates algoritam
        var random = new Random();
        int n = allStories.Count;
        while (n > 1)
        {
            n--;
            int k = random.Next(n + 1);
            var value = allStories[k];
            allStories[k] = allStories[n];
            allStories[n] = value;
        }

        return Ok(allStories);
    }



    [Route("getLikesCount/{storyId}")]
    [HttpGet]
    public async Task<IActionResult> GetLikesCount(string storyId)
    {
        if (string.IsNullOrEmpty(storyId))
        {
            return BadRequest("Invalid storyId");
        }

        var likesCount = await _client.Cypher
            .Match("(s:Story)")
            .Where((Story s) => s.Id.ToString() == storyId)
            .Return(s => s.As<Story>().NumLikes)
            .ResultsAsync;

        if (likesCount.Any())
        {
            return Ok(likesCount.First());
        }

        return NotFound("Story not found");
    }




    [Route("getAllStories")]
    [HttpGet]
    public async Task<IActionResult> GetAllStories()
    {
        var allStories = await _client.Cypher
            .Match("(s:Story)")
            .Return(s => s.As<Story>())
            .ResultsAsync;

        return Ok(allStories);
    }
    [Route("likeStory/{storyId}/{userId}")]
    [HttpPost]
    public async Task<IActionResult> LikeStory(string storyId, string userId)
    {
        if (string.IsNullOrEmpty(storyId) || string.IsNullOrEmpty(userId))
        {
            return BadRequest("Invalid storyId or userId");
        }

        var storyExists = await _client.Cypher
            .Match("(s:Story { Id: $storyId })")
            .WithParam("storyId", storyId)
            .Return(s => s.As<Story>())
            .ResultsAsync;

        if (!storyExists.Any())
        {
            return NotFound("Story not found");
        }

        var userExists = await _client.Cypher
            .Match("(u:User { Id: $userId })")
            .WithParam("userId", userId)
            .Return(u => u.As<User>())
            .ResultsAsync;

        if (!userExists.Any())
        {
            return NotFound("User not found");
        }

        var areFriends = await _client.Cypher
        .Match("(u1:User)-[:je_prijatelj]->(u2:User)")
        .Where((User u1) => u1.Id == userId)
        .OptionalMatch("(s:Story { Id: $storyId, Creator: u2.Id })<-[:Published]-(u2)")
        .WithParams(new { storyId })
        .With("COUNT(u2) AS friendCount")
        .Return<bool>("friendCount > 0")
        .ResultsAsync;

        bool areFriendsResult = areFriends.FirstOrDefault();

        if (!areFriendsResult)
        {
            return BadRequest("User and the creator of the story are not friends");
        }



        var likedRelationshipExists = await _client.Cypher
            .Match("(usr:User)-[:Liked]->(s:Story { Id: $storyId })")
            .Where((User usr) => usr.Id == userId)
            .AndWhere((Story s) => s.Id.ToString() == storyId)
            .Return(usr => usr.As<User>())
            .ResultsAsync;

        if (likedRelationshipExists.Any())
        {
            return BadRequest("User already liked the story");
        }

        await _client.Cypher
            .Match("(usr:User { Id: $userId })", "(s:Story { Id: $storyId })")
            .WithParams(new { userId, storyId })
            .Merge("(usr)-[:Liked]->(s)")
            .ExecuteWithoutResultsAsync();

        await _client.Cypher
            .Match("(s:Story { Id: $storyId })")
            .WithParam("storyId", storyId)
            .Set("s.NumLikes = s.NumLikes + 1")
            .ExecuteWithoutResultsAsync();

        return Ok($"User {userId} liked the story {storyId}");
    }

    [Route("unlikeStory/{storyId}/{userId}")]
    [HttpPost]
    public async Task<IActionResult> UnlikeStory(string storyId, string userId)
    {
        if (string.IsNullOrEmpty(storyId) || string.IsNullOrEmpty(userId))
        {
            return BadRequest("Invalid storyId or userId");
        }

        var storyExists = await _client.Cypher
            .Match("(s:Story)")
            .Where((Story s) => s.Id.ToString() == storyId)
            .Return(s => s.As<Story>())
            .ResultsAsync;

        if (!storyExists.Any())
        {
            return NotFound("Story not found");
        }

        var userExists = await _client.Cypher
            .Match("(u:User)")
            .Where((User u) => u.Id == userId)
            .Return(u => u.As<User>())
            .ResultsAsync;

        if (!userExists.Any())
        {
            return NotFound("User not found");
        }

        var likedRelationshipExists = await _client.Cypher
            .Match("(usr:User)-[:Liked]->(s:Story)")
            .Where((User usr) => usr.Id == userId)
            .AndWhere((Story s) => s.Id.ToString() == storyId)
            .Return(usr => usr.As<User>())
            .ResultsAsync;

        if (!likedRelationshipExists.Any())
        {
            return BadRequest("User has not liked the story");
        }
        await _client.Cypher
            .Match("(usr:User)-[r:Liked]->(s:Story)")
            .Where((User usr) => usr.Id == userId)
            .AndWhere((Story s) => s.Id.ToString() == storyId)
            .Delete("r")
            .ExecuteWithoutResultsAsync();

        await _client.Cypher
            .Match("(s:Story)")
            .Where((Story s) => s.Id.ToString() == storyId)
            .Set("s.NumLikes = CASE WHEN s.NumLikes > 0 THEN s.NumLikes - 1 ELSE 0 END")
            .ExecuteWithoutResultsAsync();

        return Ok($"User {userId} unliked the story {storyId}");
    }



}