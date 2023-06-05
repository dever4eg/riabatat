const { DynamoDBClient, PutItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const client = new DynamoDBClient({ region: 'eu-central-1' });
const { randomUUID } = require('crypto');

module.exports.handler = async (event) => {

  try {
    const body = event.body;
    console.log('received telegram event', body);
  
    if (!body) {
      console.log('body is empty', body);
      return {
        statusCode: 200
      };
    }

    const { message } = JSON.parse(body);
    
    const { chat } = message || {};
    const telegramChatId = chat ? chat.id : undefined;
    

    // Checking the presence of the user in the database
    const command = new ScanCommand({
      FilterExpression: 'telegramChatId = :telegramChatId',
      ExpressionAttributeValues: {
        ':telegramChatId': { S: telegramChatId.toString() },
      },
      ProjectionExpression: 'id, firstname, lastname, username',
      TableName: 'riabatat-dev-users'
    });

    const response = await client.send(command);
    
    const isUserExist = response.Items.length > 0;

    // Creating a record only if the user does not exist
    if (!isUserExist) {
      console.log('user not found, saving telegram user to db');

      const uuid = randomUUID();
      const firstname = chat ? chat.first_name || '' : '';
      const lastname = chat ? chat.last_name || '' : '';
      const username = chat ? chat.username || '' : '';
      
      console.log('uuid:', uuid);
      console.log('firstname:', firstname);
      console.log('lastname:', lastname);
      console.log('username:', username);
      
      const putParams = {
        TableName: 'riabatat-dev-users',
        Item: {
          id: { S: uuid },
          telegramChatId: { S: telegramChatId.toString() },
          
          // Checking the presence and assignment of parameters
          ...(firstname && { firstname: { S: firstname } }),
          ...(lastname && { lastname: { S: lastname } }),
          ...(username && { username: { S: username } }),
        }
      };
      
      const putCommand = new PutItemCommand(putParams);
      await client.send(putCommand);
        
      console.log('created user in db:', firstname, lastname, username);
    }
    
    return {
      statusCode: 200
    };
  } catch (error) {
    console.error('error during processing telegram event', error);

    return {
      statusCode: 200
    };
  }
};
