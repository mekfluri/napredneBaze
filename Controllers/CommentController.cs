
using Microsoft.AspNetCore.Mvc;
using Neo4jClient;
using Neo4j;
using napredneBaze.Models;

namespace BazePodatakaProjekat.Controllers
{
    public class CommentController : ControllerBase
    {
        private IGraphClient _client;

        public CommentController(IGraphClient client)
        {
            _client = client;
        }

        [Route("createComment/{userId}/{storyId}")]
        [HttpPost]
        public async Task<IActionResult> CreateComment(string userId, string storyId, [FromBody] Comment comment)
        {
            comment.Id = Guid.NewGuid();

            await _client.Cypher.Create("(d:Comment $com)")
                .WithParam("com", comment)
                .ExecuteWithoutResultsAsync();

            await _client.Cypher.Match("(usr:User)", "(s:Story)", "(c:Comment)")
                .Where((User usr) => usr.Id == userId)
                .AndWhere((Story s) => s.Id.ToString() == storyId)
                .AndWhere((Comment c) => c.Id == comment.Id)
                .Create("(usr)-[:Made_comment]->(c)")
                .Create("(c)-[:Comment_on_story]->(s)")
                .ExecuteWithoutResultsAsync();

            return Ok();
        }

        [Route("deleteComment/{commentId}/{userId}/{storyId}")]
        [HttpDelete]
        public async Task<IActionResult> DeleteComment(string commentId, string userId, string storyId)
        {
            await _client.Cypher.Match("(kom:Comment)-[createComRel:Comment_on_story]->(s:Story)", "(u:User)-[madeComRel:Made_comment]->(kom)")
                .Where((Story s) => s.Id.ToString() == storyId)
                .AndWhere((User u) => u.Id == userId)
                .AndWhere((Comment kom) => kom.Id.ToString() == commentId)
                .Delete("createComRel")
                .Delete("madeComRel")
                .Delete("kom")
                .ExecuteWithoutResultsAsync();

            return Ok();
        }

        [Route("editComment/{commentId}")] // Only if the user created the comment
        [HttpPut]
        public async Task<IActionResult> EditComment(string commentId, [FromBody] Comment comment)
        {
            await _client.Cypher.Match("(c:Comment)")
                .Where((Comment c) => c.Id.ToString() == commentId)
                .Set("c=$comment")
                .Set("c.Id=$oldId")
                .WithParam("comment", comment)
                .WithParam("oldId", commentId)
                .ExecuteWithoutResultsAsync();
            return Ok();
        }

        [Route("getStoryComments/{storyId}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Comment>>> GetStoryComments(string storyId)
        {
            var comments = await _client.Cypher.Match("(c:Comment)-[:Comment_on_story]->(s:Story)")
                .Where((Story s) => s.Id.ToString() == storyId)
                .Return(c => c.As<Comment>()).ResultsAsync;

            return Ok(comments);
        }
    }
}
