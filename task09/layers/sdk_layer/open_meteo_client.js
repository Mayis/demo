const axios = require("axios");

class OpenMeteoClient {
  static BASE_URL = "https://api.open-meteo.com/v1/forecast";

  static async getWeatherForecast(latitude, longitude) {
    const params = {
      latitude,
      longitude,
      hourly: "temperature_2m,relative_humidity_2m,wind_speed_10m",
      current_weather: true,
    };
    const response = await axios.get(OpenMeteoClient.BASE_URL, { params });
    return response.data;
  }
}

module.exports = OpenMeteoClient;
