const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TARGET_TABLE || "Events";

exports.handler = async (event) => {
  console.log("Request body:", event.body);

  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    const { principalId, content } = requestBody;

    // Validate input
    if (!principalId || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          statusCode: 400,
          error: "Invalid request body",
        }),
        headers: { "Content-Type": "application/json" },
      };
    }

    // Generate event data
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    // Log the created event
    console.log("Created event:", {
      id,
      principalId,
      createdAt,
      body: content,
    });

    // Save to DynamoDB
    const params = {
      TableName: tableName,
      Item: {
        id,
        principalId,
        createdAt,
        body: content,
      },
    };

    console.log("Putting item into DynamoDB...");
    await dynamoDb.put(params).promise();
    console.log("Item successfully put into DynamoDB");

    // Prepare the response
    const response = {
      statusCode: 201,
      event: {
        id,
        principalId,
        createdAt,
        body: content,
      },
    };

    console.log("Response JSON:", JSON.stringify(response));

    return {
      statusCode: 201,
      body: JSON.stringify(response),
      headers: { "Content-Type": "application/json" },
    };
  } catch (error) {
    console.error("Error:", error.message);
    console.error("Stack Trace:", error.stack);

    return {
      statusCode: 500,
      body: JSON.stringify({
        statusCode: 500,
        error: error.message,
      }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
