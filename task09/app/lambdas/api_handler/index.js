const axios = require('axios');

exports.handler = async event => {
  const weatherApi =
    'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m';

  const response = await axios.get(weatherApi);

  if (event.requestContext.http.path === '/weather') {
    return JSON.stringify(response.data);
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      statusCode: 400,
      message:
        'Bad request syntax or unsupported method. Request path: /cmtr-7776e06b. HTTP method: GET',
    }),
  };
};
