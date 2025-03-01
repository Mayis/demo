exports.handler = async (event) => {
  event.Records.forEach((record) => {
    const messageBody = record.body;
    console.log("Received SQS message:", messageBody);
  });
};
