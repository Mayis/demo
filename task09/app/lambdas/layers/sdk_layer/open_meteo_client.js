const axios = require("axios");

class OpenMeteoClient {
  static BASE_URL = "https://api.open-meteo.com/v1/forecast";

  /**
   * Initializes the OpenMeteoClient with latitude and longitude.
   * @param {number} latitude - The latitude of the location.
   * @param {number} longitude - The longitude of the location.
   */
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  /**
   * Fetches weather data from the Open-Meteo API.
   * @returns {Promise<Object>} - The weather data as a JSON object.
   * @throws {Error} - If the request fails or the response is not successful.
   */
  async getWeather() {
    const params = {
      latitude: this.latitude,
      longitude: this.longitude,
      current: "temperature_2m,wind_speed_10m",
      hourly: "temperature_2m,relative_humidity_2m,wind_speed_10m",
    };

    try {
      const response = await axios.get(OpenMeteoClient.BASE_URL, { params });
      return response.data;
    } catch (error) {
      // Throw an error if the request fails or the response is not successful
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
  }
}

module.exports = OpenMeteoClient;
