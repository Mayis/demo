const AWS = require("aws-sdk");
const uuid = require("uuid");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  for (const record of event.Records) {
    if (record.eventName === "INSERT" || record.eventName === "MODIFY") {
      const newImage = record.dynamodb.NewImage;
      const oldImage = record.dynamodb.OldImage;

      const auditItem = {
        id: uuid.v4(),
        itemKey: newImage.key.S,
        modificationTime: new Date().toISOString(),
      };

      if (record.eventName === "INSERT") {
        auditItem.newValue = {
          key: newImage.key.S,
          value: parseInt(newImage.value.N),
        };
      } else if (record.eventName === "MODIFY") {
        auditItem.updatedAttribute = "value";
        auditItem.oldValue = parseInt(oldImage.value.N);
        auditItem.newValue = parseInt(newImage.value.N);
      }

      const params = {
        TableName: process.env.TARGET_TABLE,
        Item: auditItem,
      };

      await dynamoDb.put(params).promise();
    }
  }
};
