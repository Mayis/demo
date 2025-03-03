const AWS = require("aws-sdk");
const uuid = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const requestBody = JSON.parse(event.body);
    const { principalId, content } = requestBody;

    const eventId = uuid.v4();
    const createdAt = new Date().toISOString();

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

    const response = {
      statusCode: 201,
      body: JSON.stringify({
        event: {
          id: eventId,
          principalId,
          createdAt,
          body: content,
        },
      }),
    };

    return response;
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
