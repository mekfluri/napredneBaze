using Microsoft.AspNetCore.Mvc;
using napredneBaze.Models;
using Neo4jClient;
using Neo4jClient.Cypher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace napredneBaze.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HighlightController : ControllerBase
    {
        private readonly IGraphClient _client;

        public HighlightController(IGraphClient client)
        {
            _client = client;
        }

        [HttpPost]
        [Route("CreateHighlight")]
        public async Task<IActionResult> CreateHighlight(string userId, [FromBody] Highlight highlight)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("UserId is required to create a Highlight");
            }

            highlight.Id = Guid.NewGuid();

            try
            {
                
                await _client.Cypher.Create("(h:Highlight $highlight)")
                    .WithParam("highlight", highlight)
                    .ExecuteWithoutResultsAsync();

                
                var userExists = await _client.Cypher
                    .Match("(u:User)")
                    .Where((User u) => u.Id == userId)
                    .Return(u => u.As<User>())
                    .ResultsAsync;

               
                if (!userExists.Any())
                {
                    return BadRequest("User not found");
                }

                
                await _client.Cypher.Match("(u:User)", "(h:Highlight)")
                    .Where((User u) => u.Id == userId)
                    .AndWhere((Highlight h) => h.Id == highlight.Id)
                    .Create("(u)-[:HAS_HIGHLIGHT]->(h)")
                    .ExecuteWithoutResultsAsync();

                return Ok(highlight);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error creating Highlight");
            }
        }


      

        [HttpPost]
        [Route("{highlightId}/AddStory/{storyId}")]
        public async Task<IActionResult> AddStoryToHighlight(string highlightId, string storyId)
        {
            try
            {
               
                var storyExistsCount = await _client.Cypher
                     .Match("(s:Story { Id: $storyId })-[:PART_OF_HIGHLIGHT]->(h:Highlight { Id: $highlightId })")
                    .WithParam("highlightId", highlightId)
                    .WithParam("storyId", storyId)
                    .Return(s => s.Count())
                    .ResultsAsync;

                var storyExists = storyExistsCount.FirstOrDefault(); 

                if (storyExists > 0)
                {
                    var existingResponseObj = new
                    {
                        Message = $"Story with id {storyId} already exists in Highlight with id {highlightId}",
                        Success = false
                    };

                    return Conflict(existingResponseObj); // Koristimo Conflict (HTTP status code 409) da bismo označili konflikt
                }

                
                await _client.Cypher.Match("(h:Highlight { Id: $highlightId })")
                    .Match("(s:Story { Id: $storyId })")
                    .Create("(s)-[:PART_OF_HIGHLIGHT]->(h)")
                    .WithParam("highlightId", highlightId)
                    .WithParam("storyId", storyId)
                    .ExecuteWithoutResultsAsync();

                var responseObj = new
                {
                    Message = $"Story with id {storyId} added to Highlight with id {highlightId}",
                    Success = true
                };

                return Ok(responseObj);
            }
            catch (Exception ex)
            {
                var errorResponseObj = new
                {
                    Message = "Error adding story to Highlight",
                    Success = false,
                    ErrorDetails = ex.Message
                };

                return StatusCode(500, errorResponseObj);
            }
        }



        [HttpGet]
        [Route("getHighlightsFromUser/{userId}")]
        public async Task<ActionResult<IEnumerable<Highlight>>> GetHighlightsByUserId(string userId)
        {
            try
            {
                var highlights = await _client.Cypher
                .Match("(u:User { Id: $userId })-[:HAS_HIGHLIGHT]->(h:Highlight)")
                .WithParam("userId", userId)
                .Return(h => h.As<Highlight>())
                .ResultsAsync;


                return Ok(highlights);
            }
            catch (Exception ex)
            {
                
                Console.WriteLine($"Error retrieving Highlights: {ex.Message}");

                
                return StatusCode(500, $"Error retrieving Highlights: {ex.Message}");
            }
        }




        [HttpDelete]
        [Route("DeleteAllHighlights")]
        public async Task<IActionResult> DeleteAllHighlights()
        {
            try
            {
                
                await _client.Cypher.Match("(h:Highlight)-[r]-()")
                    .Delete("h, r")
                    .ExecuteWithoutResultsAsync();

                return Ok("All highlights deleted successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error deleting all highlights");
            }
        }



        [HttpDelete]
        [Route("{highlightId}")]
        public async Task<IActionResult> DeleteHighlight(string highlightId)
        {
            try
            {
                await _client.Cypher.OptionalMatch("(h:Highlight { Id: $highlightId })-[r]-()")
                    .Delete("h, r")
                    .WithParam("highlightId", highlightId)
                    .ExecuteWithoutResultsAsync();

                return Ok("Highlight deleted successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error deleting Highlight");
            }
        }
    }
}
