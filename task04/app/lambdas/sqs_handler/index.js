const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event));

  try {
    let requestData;
    if (event.body) {
      try {
        requestData = JSON.parse(event.body);
      } catch (e) {
        console.error("Error parsing request body:", e);
        return formatResponse(400, { error: "Invalid request body format" });
      }
    } else {
      requestData = event;
    }

    if (!requestData.principalId) {
      return formatResponse(400, { error: "principalId is required" });
    }

    const id = uuidv4();
    const timestamp = new Date().toISOString();

    const item = {
      id: id,
      principalId: requestData.principalId,
      createdAt: timestamp,
      body: requestData.content || {},
    };

    const params = {
      TableName: process.env.TABLE_NAME,
      Item: item,
    };

    await dynamoDB.put(params).promise();
    console.log("Successfully saved event to DynamoDB:", item);

    return {
      statusCode: 201,
      event: item,
    };
  } catch (error) {
    console.error("Error processing request:", error);
    return formatResponse(500, { error: "Internal server error" });
  }
};

function formatResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(body),
  };
}
