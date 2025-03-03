exports.handler = async (event) => {
  console.log("Received SNS event:", JSON.stringify(event, null, 2));
  return "Processed successfully";
};
