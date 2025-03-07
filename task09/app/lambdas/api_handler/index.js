const { AbstractLambda } = require("commons/abstract_lambda");
const { getLogger } = require("commons/log_helper");
const { OpenMeteoClient } = require("../layers/sdk_layer/open_meteo_client");

const _LOG = getLogger(__name__);

class ApiHandler extends AbstractLambda {
  validateRequest(event) {
    // Implement validation logic if needed
    return {};
  }

  async handleRequest(event, context) {
    // Extract request details
    const path = event.rawPath || "";
    const method = event.requestContext?.http?.method || "";

    // Validate request
    if (path !== "/weather" || method !== "GET") {
      return this.generateBadRequestResponse(path, method);
    }

    try {
      // Fetch and return weather data
      const weatherData = await this.fetchWeatherData();
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(weatherData, null, 4),
      };
    } catch (e) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Internal server error: ${e.message}`,
        }),
      };
    }
  }

  async fetchWeatherData() {
    // Fetch weather data from Open-Meteo using the custom SDK
    const client = new OpenMeteoClient({ latitude: 52.52, longitude: 13.41 });
    const rawData = await client.getWeather();
    return this.transformWeatherJson(rawData);
  }

  transformWeatherJson(rawData) {
    // Extract and restructure relevant weather data
    return {
      latitude: rawData.latitude,
      longitude: rawData.longitude,
      generationtime_ms: rawData.generationtime_ms,
      utc_offset_seconds: rawData.utc_offset_seconds,
      timezone: rawData.timezone,
      timezone_abbreviation: rawData.timezone_abbreviation,
      elevation: rawData.elevation,
      hourly_units: rawData.hourly_units,
      hourly: rawData.hourly,
      current_units: rawData.current_units,
      current: rawData.current,
    };
  }

  generateBadRequestResponse(path, method) {
    // Generate a standardized 400 Bad Request response
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        statusCode: 400,
        message: `Bad request syntax or unsupported method. Request path: ${path}. HTTP method: ${method}`,
      }),
    };
  }
}

const HANDLER = new ApiHandler();

exports.lambdaHandler = async (event, context) => {
  return HANDLER.lambdaHandler(event, context);
};
