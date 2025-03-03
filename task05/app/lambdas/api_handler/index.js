const AWS = require("aws-sdk");
const uuid = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const requestBody = JSON.parse(event.body);
    const { principalId, content } = requestBody;

    // Validate input
    if (!principalId || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          statusCode: 400,
          error: "Missing principalId or content",
        }),
        headers: { "Content-Type": "application/json" },
      };
    }

    // Generate event data
    const eventId = uuid.v4();
    const createdAt = new Date().toISOString();

    // Save to DynamoDB
    const params = {
      TableName: process.env.TARGET_TABLE,
      Item: {
        id: eventId,
        principalId,
        createdAt,
        body: content,
      },
    };

    await dynamoDb.put(params).promise();

    // Prepare the response
    const response = {
      statusCode: 201,
      body: JSON.stringify({
        statusCode: 201, // Include statusCode in the body
        event: {
          id: eventId,
          principalId,
          createdAt,
          body: content,
        },
      }),
      headers: { "Content-Type": "application/json" },
    };

    return response;
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        statusCode: 500,
        error: "Internal Server Error",
      }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
