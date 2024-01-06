
using napredneBaze.Authentication;
using napredneBaze.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

using Neo4j.Driver;
using Neo4jClient;
using Neo4jClient.Cypher;
using System.ComponentModel.DataAnnotations;
using System.Web;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace napredneBaze.Controllers;
[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{
    private readonly IGraphClient _client;
    private readonly UserManager<AppUser> _userManager;
    private IConfiguration _configuration;


    public UserController(IGraphClient client, UserManager<AppUser> userManager, IConfiguration configuration)
    {
        _client = client;
        _userManager = userManager;
        _configuration = configuration;
       
        

    }

    
    [Route("getMaxId")]
    [HttpGet]
    public async Task<string> getMaxId()
    {


        var str = await _client.Cypher.Match("(n:User)")
                        .With("n , n.Id as id")
                        .OrderByDescending("id")
                        .Limit(1)
                        .Return(id => id.As<string>()).ResultsAsync;

        var lista = str.Any();
        
        if (lista)
        {
            var s = str.Single();
            return s;

        }
        else return "-1";
    }

    [Route("getAllUsers")]
    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _client.Cypher.Match("(n: User)")
                                              .Return(n => n.As<User>()).ResultsAsync;

        return Ok(users);
    }

    [Route("getUserById/{id}")]
    [HttpGet]
    public async Task<IActionResult> GetById(string id)
    {
        var users = await _client.Cypher.Match("(d:User)")
                                              .Where((User d) => d.Id == id)
                                              .Return(d => d.As<User>()).ResultsAsync;

        return Ok(users.LastOrDefault());
    }

/*
    [Route("createUser")]
    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] AppUser user)
    {

        string result = getMaxId().Result;
        int resultInt = Int32.Parse(result);
        resultInt += 1;
        result = resultInt.ToString();
        //user.Id = result;



        await _client.Cypher.Create("(d:User $user)")
                            .WithParam("user", user)
                            .ExecuteWithoutResultsAsync();

        return Ok();
    }*/



    [AllowAnonymous]
    [HttpPost]
    [Route("Register")]
    public async Task<IActionResult> Registration([FromBody] Register reg)
    {

        if (ModelState.IsValid)
        {
            var userExist = await _userManager.FindByNameAsync(reg.UserName);
            if (userExist != null)
                return BadRequest("Ovaj username je vec u upotrebi!");

            var userEmail = await _userManager.FindByEmailAsync(reg.Email);
            if (userEmail != null)
                return BadRequest("Ovaj email je vec u upotrebi!");

            var applicationUser = new  AppUser
            {

                Name = reg.Name,
                Email = reg.Email,
                LastName = reg.LastName,
                UserName = reg.UserName,
                //Hhoroscope = reg.horoscope
                //Number = reg.Phone
            } ;








           







            try
            {
                var result = await _userManager.CreateAsync(applicationUser, reg.Password);

                return Ok(result);
            }

            catch (ValidationException)
            {
                return BadRequest("Sifra mora da sadrzi najmanje 6 karaktera, da sadrzi jedno veliko slovo, jedan broj i jedan specijalni znak!");
            }
        }
        else
            return BadRequest("Podaci nisu validni!");

    }


    // samo User sa podacima korisnika
    [AllowAnonymous]
    [HttpPost]
    [Route("Login")]
    public async Task<ActionResult<User>> Login([FromBody] Login log)
    {
        if (ModelState.IsValid)
        {
            var user = await _userManager.FindByNameAsync(log.UserName);
            if (user != null && await _userManager.CheckPasswordAsync(user, log.Password))
            {

                var korisnik = new User();
                korisnik.Id = user.Id;
                korisnik.Name = user.Name;
                korisnik.LastName = user.LastName;
                korisnik.UserName = user.UserName;
                korisnik.Email = user.Email;
                korisnik.Phone = user.PhoneNumber;
                korisnik.NumbersOfFriends = user.NumbersOfFriends;
                korisnik.Interests = user.Interests;
                korisnik.ProfilePicture = user.ProfilePicture;
                korisnik.Horoscope = user.Horoscope;
                return Ok(korisnik);
            }
        }
        return BadRequest("Pogresan username ili password");
    }


    /*[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Authorize(Roles = "LogedIn, Admin")]*/
    [HttpPut]
    [Route("IzmeniKorisnika")]///{id}
    public async Task<ActionResult<User>> EditUser([FromBody] User kor)
    {
        var applicationUser = await _userManager.FindByIdAsync(kor.Id);

        if (applicationUser != null)
        {
            applicationUser.ProfilePicture = kor.ProfilePicture;
            applicationUser.Interests= kor.Interests;
            if (!string.IsNullOrWhiteSpace(kor.Name))
            {
                applicationUser.Name = kor.Name;
            }
            if (!string.IsNullOrWhiteSpace(kor.LastName))
                applicationUser.LastName = kor.LastName;

            if (!string.IsNullOrWhiteSpace(kor.Phone))
                applicationUser.PhoneNumber = kor.Phone;

            if (ModelState.IsValid)
            {



                await _userManager.UpdateAsync(applicationUser);


            }
            else
                return BadRequest("Podaci nisu validni");

            var retKor = new User
            {
                Id = applicationUser.Id.ToString(),
                Name = applicationUser.Name.ToString(),
                LastName = applicationUser.LastName.ToString(),
                UserName = applicationUser.UserName.ToString(),
                Phone = applicationUser.PhoneNumber.ToString(),
                Email = applicationUser.Email.ToString()

            };
            return Ok(retKor);
        }
        else return BadRequest("Ne postoji korisnik sa ovim id-jem!");
    }



     
    [Route("addFriend/{userId}/{friendId}")]
    [HttpPut]
    public async Task<IActionResult> addFriend(string userId, string friendId)
    {


        var following = await _client.Cypher.Match("(usr1:User)", "(usr2:User)")
                            .Where((User usr1) => usr1.Id == userId)
                            .AndWhere((User usr2) => usr2.Id == friendId)
                            .With("usr1,usr2, exists((usr1)-[:je_prijatelj]->(usr2)) as ret")
                            //.Call("return exists((n) -[:Liked]->(:Post))")
                            .Return(ret => ret.As<bool>()).ResultsAsync;

        if(following.Single())
        {
            return Ok("Vec pratite korisnika");

        }
        else
        {
           /* await _client.Cypher.Match("(usr1:User)", "(usr2:User)")
                                .Where((User usr1) => usr1.Id == userId)
                                .AndWhere((User usr2) => usr2.Id == friendId)
                                .Create("(usr1)-[r:je_prijatelj]->(usr2)")
                                .Create("(usr2)-[r1:je_prijatelj]->(usr1)")
                                .Set("usr1.NumbersOfFriends = usr1.NumbersOfFriends+1")
                                .Set("usr2.NumbersOfFriends = usr2.NumbersOfFriends+1")
                                .ExecuteWithoutResultsAsync();*/
            
            // Dodavanje dvostrane veze "je_prijatelj" između dva korisnika
            await _client.Cypher.Match("(usr1:User)", "(usr2:User)")
                                .Where((User usr1) => usr1.Id == userId)
                                .AndWhere((User usr2) => usr2.Id == friendId)
                                .Create("(usr1)-[:je_prijatelj]->(commonFriend:User)<-[:je_prijatelj]-(usr2)")
                                .ExecuteWithoutResultsAsync();

            
            return Ok();

        }
        


        
        

        
       
    }


    [Route("deleteFriend/{userId}/{friendId}")]
    [HttpPut]
    public async Task<IActionResult> deleteFriend(string userId, string friendId)
    {


        var following = await _client.Cypher.Match("(usr1:User)", "(usr2:User)")
                            .Where((User usr1) => usr1.Id == userId)
                            .AndWhere((User usr2) => usr2.Id == friendId)
                            .With("usr1,usr2, exists((usr1)-[:je_prijatelj]->(usr2)) as ret")
                            //.Call("return exists((n) -[:Liked]->(:Post))")
                            .Return(ret => ret.As<bool>()).ResultsAsync;

        if(following.Single())
        {
            await _client.Cypher.Match("(usr1:User)-[r:je_prijatelj]->(usr2)")
                           .Where((User usr1) => usr1.Id == userId)
                           .AndWhere((User usr2) => usr2.Id == friendId)
                           .Delete("r")
                           .Set("usr2.NumbersOfFriends = usr2.NumbersOfFriends-1")
                           .Set("usr1.NumbersOfFriends = usr1.NumbersOfFriends-1")
                           .ExecuteWithoutResultsAsync();
            
            await _client.Cypher.Match("(usr2:User)-[r1:je_prijatelj]->(usr1)")
                           .Where((User usr1) => usr1.Id == userId)
                           .AndWhere((User usr2) => usr2.Id == friendId)
                           .Delete("r1")
                           .ExecuteWithoutResultsAsync();

        }
        else
        {
           return Ok("Ne pratite korisnika");

        }
        



        

        return Ok();
       
    }
     /*
    //da user izbaci svog followera
    [Route("removeMyFollower/{myId}/{followerId}")]
    [HttpPut]
    public async Task<IActionResult> removeMyFollower(string myId, string followerId)
    {
        await _client.Cypher.Match("(usr1:User)-[r:Following]->(usr2)")
                          .Where((User usr1) => usr1.Id == followerId)
                          .AndWhere((User usr2) => usr2.Id == myId)
                          .Delete("r")
                          .Set("usr2.NumbersOfFollowers = usr2.NumbersOfFollowers-1")
                          .Set("usr1.NumbersOfFollowings = usr1.NumbersOfFollowings-1")
                          .ExecuteWithoutResultsAsync();

        return Ok(); 

    }
    */

    [Route("getUserByUsername/{userName}")]
    [HttpGet]
    public async Task<IActionResult> GetUserByUsername(string userName)
    {
        var users = await _client.Cypher.Match("(d:User)")
        .Where((User d) => d.UserName == userName)
        .Return(d => d.As<User>()).ResultsAsync; 
        
        return Ok(users.FirstOrDefault());


    }
     
    [Route("getUserFriends/{userId}")]
    [HttpGet]
    public async Task<IEnumerable<object>> getUserFriends(string userId)
    {
        var users = await _client.Cypher.Match("(d:User)-[je_prijatelj]->(f:User)")
                                              .Where((User d) => d.Id == userId)
                                              .Return(f => new {
                                                  Id = f.As<User>().Id,
                                                  UserName = f.As<User>().UserName,
                                                  Email = f.As<User>().Email,
                                                  ProfilePicture = f.As<User>().ProfilePicture,
                                                  Interests = f.As<User>().Interests

                                              }).ResultsAsync;
                                              //f.As<User>().UserName).ResultsAsync;//f.As<User>()).ResultsAsync;

        return users;
    }

    [Route("getUserFriendsCount/{userId}")]
    [HttpGet]
    public async Task<IActionResult> GetUserFriendsCount(string userId)
    {
        var users = await _client.Cypher.Match("(d:User)-[Following]->(f:User)")
            
                                              .Where((User d) => d.Id == userId)
                                              .Return(f => f.As<User>()).ResultsAsync;

        return Ok(users.Count());
    }

    //zajednicki prijatelji 
    [Route("getCommonFriends/{user1Id}/{user2Id}")]
    [HttpGet]
    public async Task<IActionResult> getCommonFriends(string userId1, string userId2)
    {
        var result = await _client.Cypher
            .Match("(user1:User)-[:je_prijatelj]->(commonFriend:User)<-[:je_prijatelj]-(user2:User)")
            .Where((User user1) => user1.Id == userId1)
            .AndWhere((User user2) => user2.Id == userId2)
            .Return(commonFriend => commonFriend.As<User>())
             .ResultsAsync;

        return Ok(result.ToList());
    
    
    
    }



    /*
    [Route("getUserFollowers/{userId}")]
    [HttpGet]
    public async Task<IActionResult> GetUserFollowers(string userId)
    {
        var users = await _client.Cypher.Match("(d:User)<-[Following]-(f:User)")
                                              .Where((User d) => d.Id == userId)
                                              .Return(f => new {
                                                  Id = f.As<User>().Id,
                                                  UserName = f.As<User>().UserName,
                                                  Email = f.As<User>().Email,
                                                  ProfilePicture = f.As<User>().ProfilePicture,
                                                  ProfileDescription = f.As<User>().ProfileDescription
                                              }).ResultsAsync;

        return Ok(users);
    }

    [Route("getUserFollowersCount/{userId}")]
    [HttpGet]
    public async Task<IActionResult> GetUserFollowersCount(string userId)
    {
        var users = await _client.Cypher.Match("(d:User)<-[Following]-(f:User)")

                                              .Where((User d) => d.Id == userId)
                                              .Return(f => f.As<User>()).ResultsAsync;

        return Ok(users.Count());
    }*/





}