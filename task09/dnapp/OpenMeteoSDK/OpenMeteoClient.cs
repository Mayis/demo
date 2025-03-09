using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace SimpleLambdaFunction;

public class OpenMeteoClient
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl = "https://api.open-meteo.com/v1/forecast";

        public OpenMeteoClient()
        {
            _httpClient = new HttpClient();
        }

        public OpenMeteoClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<WeatherForecast> GetWeatherForecastAsync(double latitude, double longitude)
        {
            var requestUrl = $"{_baseUrl}?latitude={latitude}&longitude={longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m";
            
            var response = await _httpClient.GetAsync(requestUrl);
            response.EnsureSuccessStatusCode();
            
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<WeatherForecast>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
    }

    public class WeatherForecast
    {
        [JsonPropertyName("latitude")]
        public double Latitude { get; set; }
        
        [JsonPropertyName("longitude")]
        public double Longitude { get; set; }
        
        [JsonPropertyName("generationtime_ms")]
        public double GenerationtimeMs { get; set; }
        
        [JsonPropertyName("utc_offset_seconds")]
        public int UtcOffsetSeconds { get; set; }
        
        [JsonPropertyName("timezone")]
        public string Timezone { get; set; }
        
        [JsonPropertyName("timezone_abbreviation")]
        public string TimezoneAbbreviation { get; set; }
        
        [JsonPropertyName("elevation")]
        public double Elevation { get; set; }
        
        [JsonPropertyName("hourly_units")]
        public HourlyUnits HourlyUnits { get; set; }
        
        [JsonPropertyName("hourly")]
        public Hourly Hourly { get; set; }
        
        [JsonPropertyName("current_units")]
        public CurrentUnits CurrentUnits { get; set; }
        
        [JsonPropertyName("current")]
        public Current Current { get; set; }
    }

    public class HourlyUnits
    {
        [JsonPropertyName("time")]
        public string Time { get; set; }
        
        [JsonPropertyName("temperature_2m")]
        public string Temperature2m { get; set; }
        
        [JsonPropertyName("relative_humidity_2m")]
        public string RelativeHumidity2m { get; set; }
        
        [JsonPropertyName("wind_speed_10m")]
        public string WindSpeed10m { get; set; }
    }

    public class Hourly
    {
        [JsonPropertyName("time")]
        public string[] Time { get; set; }
        
        [JsonPropertyName("temperature_2m")]
        public double[] Temperature2m { get; set; }
        
        [JsonPropertyName("relative_humidity_2m")]
        public int[] RelativeHumidity2m { get; set; }
        
        [JsonPropertyName("wind_speed_10m")]
        public double[] WindSpeed10m { get; set; }
    }

    public class CurrentUnits
    {
        [JsonPropertyName("time")]
        public string Time { get; set; }
        
        [JsonPropertyName("interval")]
        public string Interval { get; set; }
        
        [JsonPropertyName("temperature_2m")]
        public string Temperature2m { get; set; }
        
        [JsonPropertyName("wind_speed_10m")]
        public string WindSpeed10m { get; set; }
    }

    public class Current
    {
        [JsonPropertyName("time")]
        public string Time { get; set; }
        
        [JsonPropertyName("interval")]
        public int Interval { get; set; }
        
        [JsonPropertyName("temperature_2m")]
        public double Temperature2m { get; set; }
        
        [JsonPropertyName("wind_speed_10m")]
        public double WindSpeed10m { get; set; }
    }