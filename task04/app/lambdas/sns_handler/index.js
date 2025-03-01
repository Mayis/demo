exports.handler = async (event) => {
  const message = event.Records[0].Sns.Message;
  console.log("Received SNS message:", message);
};
