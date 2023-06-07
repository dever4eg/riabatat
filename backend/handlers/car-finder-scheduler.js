const axios = require("axios");
const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { inspect } = require('util');

const client = new DynamoDBClient({ region: 'eu-central-1' });

module.exports.handler = async (event) => {
  try {
    // Получение telegramChatId из DynamoDB
    const scanCommand = new ScanCommand({
      TableName: 'riabatat-dev-users', 
    });

    const scanResult = await client.send(scanCommand);
    console.log('scanResult:', scanResult.Items);
    
    const users = scanResult.Items.map(function(item) {
      return { 
        telegramChatId: item.telegramChatId.S,
        lastname: item.lastname.S,
        firstname: item.firstname.S,
        username: item.username.S,
        id: item.id.S
      };
    });

    console.log('users:', users);
    
    const telegramChatId = scanResult.Items.map((item) => item.telegramChatId.S);
    console.log('telegramChatId:', telegramChatId);

    // Assuming you have the `id_оголошення` value
    const markaId = "9";
    const modelId = "3219";
    const sYers = "2010";
    const poYers = "2016";
    const apiKey = process.env.RIA_API_KEY;

    // Build the API URL
    const url = `https://developers.ria.com/auto/search`;

    // Make a GET request to the API
    const response = await axios.get(url, {
      params: {
        api_key: apiKey,
        'marka_id[0]': markaId,
        'model_id[0]': modelId,
        's_yers[0]': sYers,
        'po_yers[0]': poYers
      },
    });

    // Assuming the API response contains car details
    const cars = response.data;

    // Print the car details
    console.log('cars object', cars);

    // Send found cars to Telegram chat
    const telegramBotToken = process.env.TELEGRAM_TOKEN;
    const telegramMessage = `Found cars:\n\n${inspect(cars, { depth: null })}`;

    for (const chatId of telegramChatId) {
      await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        chat_id: chatId,
        text: telegramMessage
      });
    }
  } catch (error) {
    console.log('Error:', error.message);
    if (error.response) {
      console.log('responseData,', error.response.data);
      console.log('response status', error.response.status);
    }
  }
};
