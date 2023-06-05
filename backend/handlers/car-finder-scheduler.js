const axios = require("axios");
const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: 'eu-central-1' });

module.exports.handler = async (event) => {
  try {
    // Отримання списку користувачів з DynamoDB
    const scanCommand = new ScanCommand({ TableName: 'Users' });
    const scanResult = await client.send(scanCommand);
    const users = scanResult.Items.map(item => ({
      chatId: item.chatId.S,
      searchSettings: item.searchSettings.S
    }));

    console.log('Users:', users);

    // Перебір кожного користувача та виконання запиту до AutoRia
    for (const user of users) {
      const { chatId, searchSettings } = user;
      const { brand, model, year } = JSON.parse(searchSettings);
      const apiKey = process.env.RIA_API_KEY;

      console.log(`Searching cars for user with chatId ${chatId}`);
      console.log(`Search settings: brand=${brand}, model=${model}, year=${year}`);

      // Запит до API AutoRia
      const apiUrl = `https://api.auto.ria.com/brands/${brand}/models/${model}/years/${year}?api_key=${apiKey}`;
      const response = await axios.get(apiUrl);
      const data = response.data;
      const results = data.map((car) => {
        return `Марка: ${car.brand}, Модель: ${car.model}, Рік випуску: ${car.year}`;
      });

      console.log(`Found ${results.length} cars for user with chatId ${chatId}`);

      //Відправка повідомлення в Telegram
      function sendMessageTelegram(message, chatId, botToken) {
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

        const options = {
          url: telegramUrl,
          method: 'POST',
          data: {
            chat_id: chatId,
            text: message,
          },
        };

        axios(options)
          .then((response) => {
            if (response.status === 200) {
              console.log('Message sent successfully');
            } else {
              console.log('Error sending message');
            }
          })
          .catch((error) => {
            console.error('Error sending message:', error); 
          });
        }

      // Виклик функції для відправки повідомлення
      const message = results.join('\n');
      const telegramApiKey = process.env.TELEGRAM_TOKEN;
      sendMessageTelegram(message, chatId, telegramApiKey);
    }

    console.log('Finding cars');

    return { statusCode: 200 };
  } catch (error) {
    console.error('Сталася помилка:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Сталася помилка',		
      }),
    };
  }
};
