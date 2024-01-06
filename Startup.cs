using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Neo4j.Driver;
using Neo4jClient;
using System;
using Newtonsoft.Json;


namespace napredneBaze
{
    public class Startup
    {
        public IConfiguration Configuration { get; }
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddControllers().AddNewtonsoftJson(options =>
                    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            );

           var neo4jUri = new Uri("bolt://54.211.48.153:7687");
            var neo4jUser = "neo4j";
            var neo4jPassword = "hangar-stuffing-buckets";

     
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

            // Continue with your existing code
            var client = new BoltGraphClient(neo4jUri, neo4jUser, neo4jPassword);
            client.ConnectAsync();
            services.AddSingleton<IGraphClient>(client);
            services.AddAuthentication(option =>
            {
                // ...
            })
            .AddJwtBearer(options =>
            {
                // ...
            });

            // Redis i ostalo
            // ...
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                // ...
            }

            app.UseHttpsRedirection();
            app.UseRouting();

            // Cors, autentikacija i ostalo
            // ...

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                // ...
            });
        }
    }
}
