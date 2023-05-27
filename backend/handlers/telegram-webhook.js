const { DynamoDBClient, PutItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const client = new DynamoDBClient({ region: 'eu-central-1' });
const { randomUUID } = require('crypto');

module.exports.handler = async (event) => {
  
  try {
    const uuid = randomUUID();
    
    const body = event.body;

    if (!body) {
      return {
        statusCode: 200
      };
    }

    const { message } = JSON.parse(body);
    
    const { chat } = message || {};
    const chatId = chat ? chat.id : undefined;
    const firstname = chat ? chat.first_name || '' : '';
    const lastname = chat ? chat.last_name || '' : '';
    const username = chat ? chat.username || '' : '';

    // Проверка наличия пользователя в базе данных
    const command = new ScanCommand({
      FilterExpression: 'chatId = :chatId',
      ExpressionAttributeValues: {
        ':chatId': { S: chatId.toString() },
      },
      ProjectionExpression: 'id, firstname, lastname, username',
      TableName: 'riabatat-dev-users'
    });

    const response = await client.send(command);
    
    // Вывод имен пользователей
    response.Items.forEach(function(item) {
      console.log(item.id.S, item.firstname.S, item.lastname.S, item.username.S);
    });
    
    const isUserExist = response.Items.length > 0;

    // Создание записи только если пользователь не существует
    if (!isUserExist) {
      const putParams = {
        TableName: 'riabatat-dev-users',
        Item: {
          id: { S: uuid },
          chatId: { S: chatId.toString() },
          // Проверка наличия и присваивание параметров
          ...(firstname && { firstname: { S: firstname } }),
          ...(lastname && { lastname: { S: lastname } }),
          ...(username && { username: { S: username } }),
        }
      };
      
      const putCommand = new PutItemCommand(putParams);
      await client.send(putCommand);
    }
    
    return {
      statusCode: 200
    };
  } catch (error) {
    console.error('Error:', error);

    return {
      statusCode: 200
    };
  }
};
