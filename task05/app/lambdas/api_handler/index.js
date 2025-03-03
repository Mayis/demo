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
        body: JSON.stringify({ message: "Missing principalId or content" }),
      };
    }

    // Generate event data
    const eventId = uuid.v4();
    const createdAt = new Date().toISOString();

    // Save to DynamoDB
    await dynamoDb
      .put({
        TableName: process.env.TARGET_TABLE,
        Item: { id: eventId, principalId, createdAt, body: content },
      })
      .promise();

    // Return response with statusCode in the body
    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        statusCode: 201, // Include statusCode in the body
        event: { id: eventId, principalId, createdAt, body: content },
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
