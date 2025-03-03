const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event));

  const item = {
    id: uuidv4(),
    principalId: event.principalId,
    createdAt: new Date().toISOString(),
    body: event.content,
  };

  const params = {
    TableName: process.env.TABLE_NAME,
    Item: item,
  };

  try {
    const data = await dynamoDB.put(params).promise();
    console.log("PutItem succeeded:", data);
    const returnObj = {
      statusCode: 201,
      event: item,
    };

    return returnObj;
  } catch (e) {
    return JSON.stringify(e, null, 2);
  }
};
