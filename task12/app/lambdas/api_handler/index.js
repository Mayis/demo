const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

const mainHeaders = {
  'Access-Control-Allow-Headers':
    'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': '*',
  'Accept-Version': '*',
};

//signup
const handleSignup = async (email, password) => {
  const createUserParams = {
    UserPoolId: process.env.CUPId,
    Username: email,
    TemporaryPassword: password,
    UserAttributes: [{ Name: 'email', Value: email }],
    MessageAction: 'SUPPRESS',
  };

  try {
    await cognito.adminCreateUser(createUserParams).promise();
    const initiateAuthParams = {
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      UserPoolId: process.env.CUPId,
      ClientId: process.env.CUPClientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    const signinResponse = await cognito
      .adminInitiateAuth(initiateAuthParams)
      .promise();

    await cognito
      .adminRespondToAuthChallenge({
        UserPoolId: process.env.CUPId,
        ClientId: process.env.CUPClientId,
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        Session: signinResponse.Session,
        ChallengeResponses: {
          USERNAME: email,
          PASSWORD: password,
          NEW_PASSWORD: password,
        },
      })
      .promise();

    return {
      statusCode: 200,
      headers: mainHeaders,
      body: 'Sign-up process is successful',
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 400,
      headers: mainHeaders,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

//signin
const handleSignin = async (email, password) => {
  try {
    const params = {
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      UserPoolId: process.env.CUPId,
      ClientId: process.env.CUPClientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    const response = await cognito.adminInitiateAuth(params).promise();

    return {
      statusCode: 200,
      headers: mainHeaders,
      body: JSON.stringify({
        accessToken: response.AuthenticationResult.IdToken,
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: mainHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

//tables GET
const handleGetTables = async () => {
  try {
    const params = {
      TableName: process.env.tables_table,
    };

    const data = await dynamodb.scan(params).promise();

    return {
      statusCode: 200,
      headers: mainHeaders,
      body: JSON.stringify({ tables: data.Items }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: mainHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

//tables POST
const handleCreateTable = async body => {
  try {
    const params = {
      TableName: process.env.tables_table,
      Item: {
        id: body.id,
        number: body.number,
        places: body.places,
        isVip: body.isVip,
        minOrder: body.minOrder || null,
      },
    };

    await dynamodb.put(params).promise();

    return {
      statusCode: 200,
      headers: mainHeaders,
      body: JSON.stringify({ id: body.id }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: mainHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

//tables/{tableId}

const handleTableById = async tableId => {
  if (!tableId) {
    return {
      statusCode: 400,
      headers: mainHeaders,
      body: JSON.stringify({ message: 'Error in the request' }),
    };
  }

  const params = {
    TableName: process.env.tables_table,
    KeyConditionExpression: '#id = :idValue',
    ExpressionAttributeNames: {
      '#id': 'id',
    },
    ExpressionAttributeValues: {
      ':idValue': parseInt(tableId),
    },
  };

  try {
    const data = await dynamodb.query(params).promise();
    return {
      statusCode: 200,
      headers: mainHeaders,
      body: JSON.stringify(data.Items[0]),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: mainHeaders,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

const getAllReservations = async () => {
  const params = {
    TableName: process.env.reservations_table,
  };
  const data = await dynamodb.scan(params).promise();
  return data.Items;
};

const getAllTables = async () => {
  const params = {
    TableName: process.env.tables_table,
  };
  const data = await dynamodb.scan(params).promise();
  return data.Items;
};

const getReservationsByTableNumber = async tableNumber => {
  const allReservations = await getAllReservations();
  return allReservations.filter(r => r.tableNumber === tableNumber);
};

const isOverlapping = (newRes, existingRes) => {
  return existingRes.some(res => {
    const resStart = new Date(`${res.date} ${res.slotTimeStart}`);
    const resEnd = new Date(`${res.date} ${res.slotTimeEnd}`);
    const newStart = new Date(`${newRes.date} ${newRes.slotTimeStart}`);
    const newEnd = new Date(`${newRes.date} ${newRes.slotTimeEnd}`);

    if (resStart <= newStart && resEnd >= newStart) return true;
    if (resStart <= newEnd && resEnd >= newEnd) return true;
    return false;
  });
};

//reservations POST
const handleCreateReservation = async body => {
  const {
    tableNumber,
    clientName,
    phoneNumber,
    date,
    slotTimeStart,
    slotTimeEnd,
  } = body;

  const tables = await getAllTables();
  const tableExists = tables.some(t => t.number === tableNumber);
  if (!tableExists) {
    return {
      statusCode: 400,
      headers: mainHeaders,
      body: JSON.stringify({ error: 'Table does not exist' }),
    };
  }

  const existingReservations = await getReservationsByTableNumber(tableNumber);
  const newReservation = { tableNumber, date, slotTimeStart, slotTimeEnd };

  if (isOverlapping(newReservation, existingReservations)) {
    return {
      statusCode: 400,
      headers: mainHeaders,
      body: JSON.stringify({
        error: 'Reservation overlaps with an existing one',
      }),
    };
  }

  const reservationId = uuidv4();

  try {
    const params = {
      TableName: process.env.reservations_table,
      Item: {
        id: reservationId,
        tableNumber,
        clientName,
        phoneNumber,
        date,
        slotTimeStart,
        slotTimeEnd,
      },
    };

    await dynamodb.put(params).promise();

    return {
      statusCode: 200,
      headers: mainHeaders,
      body: JSON.stringify({ reservationId }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: mainHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

//reservations GET
const handleGetReservations = async () => {
  try {
    const params = {
      TableName: process.env.reservations_table,
    };

    const data = await dynamodb.scan(params).promise();

    return {
      statusCode: 200,
      headers: mainHeaders,
      body: JSON.stringify({ reservations: data.Items }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: mainHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

exports.handler = async event => {
  const { path, httpMethod } = event;
  let body;
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 400,
        headers: mainHeaders,
        body: JSON.stringify({ message: 'Invalid JSON' }),
      };
    }
  }

  if (path === '/signup' && httpMethod === 'POST') {
    return await handleSignup(body.email, body.password);
  }

  if (path === '/signin' && httpMethod === 'POST') {
    return await handleSignin(body.email, body.password);
  }

  if (event.resource === '/tables' && httpMethod === 'GET') {
    return await handleGetTables();
  }

  if (event.resource === '/tables' && httpMethod === 'POST') {
    return await handleCreateTable(body);
  }

  if (event.resource === '/tables/{tableId}' && event.httpMethod === 'GET') {
    return handleTableById(event.pathParameters.tableId);
  }

  if (path === '/reservations' && httpMethod === 'POST') {
    return await handleCreateReservation(body);
  }

  if (path === '/reservations' && httpMethod === 'GET') {
    return await handleGetReservations();
  }

  return {
    statusCode: 404,
    headers: mainHeaders,
    body: JSON.stringify({ error: 'Route not found' }),
  };
};
