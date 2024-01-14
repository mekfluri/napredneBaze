using AspNetCore.Identity.Neo4j;
using napredneBaze.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;

using Microsoft.IdentityModel.Tokens;
using Neo4j.Driver;
using Neo4jClient;
using StackExchange.Redis;
using System.Text;

using NRedisStack;
using NRedisStack.RedisStackCommands;


namespace napredneBaze
{
    public class Startup
    {
        private Uri neo4jUri;
        private string neo4jUser;
        private string neo4jPassword;

        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
            neo4jUri = new Uri("bolt://184.72.200.89:7687");
            neo4jUser = "neo4j";
            neo4jPassword = "numeral-transistor-procurement";
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers().AddNewtonsoftJson(options =>
                options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);

            services.AddTransient<IAsyncSession>(provider =>
            {
                var driver = GraphDatabase.Driver(neo4jUri, AuthTokens.Basic(neo4jUser, neo4jPassword));
                var session = driver.AsyncSession();

                try
                {
                    session.RunAsync("RETURN 1").Wait();
                    Console.WriteLine("Successfully connected to Neo4j database.");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to connect to Neo4j database. Error: {ex.Message}");
                }

                return session;
            });

            var client = new BoltGraphClient(neo4jUri, neo4jUser, neo4jPassword);
            client.ConnectAsync();
            services.AddSingleton<IGraphClient>(client);
            services.AddSingleton<IConnectionMultiplexer>(
                ConnectionMultiplexer.Connect("redis-17176.c304.europe-west1-2.gce.cloud.redislabs.com:17176,password=QNPnm6F5HaMWyk7SSlj4tBhKb1FZJDLu")
            );
            Console.WriteLine("\nConnected to redis database");
            services.AddIdentity<AppUser, Neo4jIdentityRole>(options =>
            {
                // Konfiguracija opcija Identity servisa
            })
            .AddNeo4jDataStores()
            .AddDefaultTokenProviders();

            services.AddAuthentication(options =>
           {
               options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
               options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
               options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
           })
          .AddJwtBearer(options =>
           {
               options.SaveToken = true;
               options.RequireHttpsMetadata = false;
               options.TokenValidationParameters = new TokenValidationParameters
               {
                   ValidateIssuer = true,
                   ValidateAudience = true,
                   ValidateLifetime = true,
                   ValidIssuer = Configuration["JWT:ValidIssuer"],
                   ValidAudience = Configuration["JWT:ValidAudience"],
                   IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["JWT:Secret"]))
               };
           });

            services.AddCors(options =>
            {
                options.AddPolicy("CORS", builder => builder.WithOrigins("http://127.0.0.1:5501")
                              .AllowAnyHeader()
                              .AllowAnyMethod()
                              .AllowCredentials());
            });


            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
                {
                    Title = "Your API Title",
                    Version = "v1"
                });
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Your API Title v1");
                    c.RoutePrefix = string.Empty;
                });
            }

            app.UseHttpsRedirection();
            app.UseRouting();

            app.UseCors("CORS");
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}