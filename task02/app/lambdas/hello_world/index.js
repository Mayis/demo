exports.handler = async (event) => {
  // Extract the HTTP method and path from the event object
  const httpMethod = event.requestContext.http.method;
  const path = event.requestContext.http.path;

  if (httpMethod === "GET" && path === "/hello") {
    return {
      statusCode: 200,
      body: JSON.stringify({
        statusCode: 200,
        message: "Hello from Lambda",
      }),
    };
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
