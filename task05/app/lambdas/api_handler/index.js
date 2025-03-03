const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { v4: uuidv4 } = require("uuid");

const dynamoDb = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.TARGET_TABLE || "Events";

exports.handler = async (event, context) => {
  console.log(`AwsRequestId: ${context.awsRequestId}`);
  console.log(`Table name: ${tableName}`);
  console.log(`Request body: ${event.body}`);

  try {
    const requestBody = JSON.parse(event.body);
    console.log(
      `Deserialized request: PrincipalId=${requestBody.PrincipalId}, Content=${
        requestBody.Content != null
      }`
    );

    if (requestBody.PrincipalId <= 0 || !requestBody.Content) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          statusCode: 400,
          error: "Invalid request body",
        }),
        headers: { "Content-Type": "application/json" },
      };
    }

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    const newEvent = {
      id,
      principalId: requestBody.PrincipalId,
      createdAt,
      body: requestBody.Content,
    };

    console.log(
      `Created event: id=${id}, principalId=${requestBody.PrincipalId}, createdAt=${createdAt}`
    );

    const item = {
      id: { S: id },
      principalId: { N: requestBody.PrincipalId.toString() },
      createdAt: { S: createdAt },
      body: { S: JSON.stringify(requestBody.Content) },
    };

    console.log("Putting item into DynamoDB...");
    await dynamoDb.send(
      new PutItemCommand({
        TableName: tableName,
        Item: item,
      })
    );
    console.log("Item successfully put into DynamoDB");

    const response = {
      statusCode: 201,
      body: JSON.stringify({
        statusCode: 201,
        event: newEvent,
      }),
      headers: { "Content-Type": "application/json" },
    };

    console.log(`Response JSON: ${response.body}`);
    return response;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error(`Stack Trace: ${error.stack}`);

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
