using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace SimpleLambdaFunction;

public class Function
{
    private static readonly HttpClient HttpClient = new();
    private const string WeatherApiUrl = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m";

    public async Task<APIGatewayHttpApiV2ProxyResponse> FunctionHandler(APIGatewayHttpApiV2ProxyRequest request, ILambdaContext context)
    {
        var requestPath = string.IsNullOrEmpty(request.RequestContext.Http.Path) ? "Unknown" : request.RequestContext.Http.Path;
        var requestMethod = string.IsNullOrEmpty(request.RequestContext.Http.Method) ? "Unknown" : request.RequestContext.Http.Method;
        
        if (requestMethod != "GET" || requestPath != "/weather")
        {
            return new APIGatewayHttpApiV2ProxyResponse
            {
                StatusCode = 400,
                Body = JsonSerializer.Serialize(new { statusCode = 400, message = $"Bad request syntax or unsupported method. Request path: {requestPath}. HTTP method: {requestMethod}" }),
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }

        try
        {
            var response = await HttpClient.GetAsync(WeatherApiUrl);
            response.EnsureSuccessStatusCode();
            var weatherData = await response.Content.ReadAsStringAsync();

            return new APIGatewayHttpApiV2ProxyResponse
            {
                StatusCode = 200,
                Body = weatherData,
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
        catch
        {
            return new APIGatewayHttpApiV2ProxyResponse
            {
                StatusCode = 500,
                Body = JsonSerializer.Serialize(new { statusCode = 500, message = "Internal Server Error" }),
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
    }
}