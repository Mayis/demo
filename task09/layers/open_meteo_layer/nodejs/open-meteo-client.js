const axios = require("axios");

class OpenMeteoClient {
  static BASE_URL =
    "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m";

  static async getWeatherForecast() {
    const response = await axios.get(OpenMeteoClient.BASE_URL);
    return response.data;
  }
}

module.exports = OpenMeteoClient;
