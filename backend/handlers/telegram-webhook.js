const { DynamoDBClient, PutItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const client = new DynamoDBClient({ region: 'eu-central-1' });

module.exports.handler = async (event) => {
  const { randomUUID } = require('crypto');
  const uuid = randomUUID();
console.log(uuid);
  try {
    const body = event.body;
console.log(body);
    if (!body) {
      return {
        statusCode: 200
      };
    }

    const { message } = JSON.parse(body);
    console.log(message);

    let id;
    let chatId;
    let firstname;
    let lastname;
    let username;

    if (message && message.text) {
      const { chat } = message;
      id = uuid;
      chatId = chat.id;
      firstname = chat.first_name || '';
      lastname = chat.last_name || '';
      username = chat.username || '';
    }

    // Проверка наличия пользователя в базе данных
    const getItemCommand = new GetItemCommand({
      Key: {
        chatId: { N: chatId.toString() }
      },
      TableName: 'riabatat-dev-users',
    });
  
    const getItemResponse = await client.send(getItemCommand);
      console.log(getItemResponse);
       
    // Создание записи только если пользователь не существует
    if (!getItemResponse.Item) {
      const putCommand = new PutItemCommand({
        TableName: 'riabatat-dev-users',
        Item: {
          id: { S: uuid },
          chatId: { N: chatId.toString() },
          // Проверка наличия и присваивание параметров
          ...(firstname && { firstname: { S: firstname } }),
          ...(lastname && { lastname: { S: lastname } }),
          ...(username && { username: { S: username } }),
        },
      });

      // Execute PutItem command to save data in DynamoDB
      await client.send(putCommand);
    }

    return {
      statusCode: 200,
    };
  } catch (error) {
    console.error('Error:', error);

    return {
      statusCode: 200, 
    };
  }
};
