const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");

const s3Client = new S3Client({ region: process.env.AWS_REGION });

exports.handler = async (event, context) => {
  const executionTime = new Date().toISOString();

  const uuids = [];
  for (let i = 0; i < 10; i++) {
    uuids.push(uuidv4());
  }

  const data = { ids: uuids };
  const jsonData = JSON.stringify(data, null, 2);

  const bucketName = process.env.TARGET_BUCKET || "uuid-storage";
  const fileName = executionTime;

  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: jsonData,
    ContentType: "application/json",
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    console.log(`Successfully stored UUIDs in ${bucketName}/${fileName}`);
    return `UUIDs generated and stored successfully at ${executionTime}`;
  } catch (error) {
    console.error(`Error storing UUIDs: ${error.message}`);
    throw error;
  }
};
