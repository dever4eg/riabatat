const axios = require("axios");
const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: 'eu-central-1' });

module.exports.handler = async (event) => {
  try {
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
    console.log(cars);

    // Fetch Telegram chat ID from DynamoDB
    const chatId = await getTelegramChatIdFromDB(); // Replace with your own function to fetch chat ID from DynamoDB

    // Send found cars to Telegram chat
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

    const telegramMessage = `Found cars:\n\n${JSON.stringify(cars, null, 2)}`;

    await axios.post(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        chat_id: chatId,
        text: telegramMessage,
      }
    );

  } catch (error) {
    console.log('Error:', error.message);
    if (error.response) {
      console.log('responseData,', error.response.data);
      console.log('response status',error.response.status);
    } 
  }
};

async function getTelegramChatIdFromDB() {
  const dynamoDbParams = {
    TableName: 'riabatat-dev-users', // Replace with your DynamoDB table name
    Key: {
      telegramChatId: { S: 'telegramChatId' }, // Replace with the primary key of the item that stores the chat ID
    },
  };

  const command = new GetItemCommand(dynamoDbParams);
  const data = await client.send(command);

  // Extract the chat ID from the DynamoDB response
  const chatId = data.Item?.chatId?.S;

  return chatId;
}
