const OpenMeteoClient = require("/opt/nodejs/openMeteoClient");

exports.handler = async (event) => {
  const httpMethod = event.httpMethod;
  const path = event.path;

  if (httpMethod === "GET" && path === "/weather") {
    try {
      const weatherData = await OpenMeteoClient.getWeatherForecast();
      return {
        statusCode: 200,
        body: JSON.stringify(weatherData),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        message: `Bad request syntax or unsupported method. Request path: ${path}. HTTP method: ${httpMethod}`,
      }),
    };
  }
};
