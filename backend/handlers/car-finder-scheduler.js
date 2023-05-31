const axios = require("axios");
const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const request = require("request");

const client = new DynamoDBClient({ region: 'eu-central-1' });

module.exports.handler = async (event) => {
  try {
    // Получение списка пользователей из DynamoDB
    const scanCommand = new ScanCommand({ TableName: 'Users' });
    const scanResult = await client.send(scanCommand);
    const users = scanResult.Items.map(item => ({
      chatId: item.chatId.S,
      searchSettings: item.searchSettings.S
    }));

    console.log('Users:', users);

    // Перебор каждого пользователя и выполнение запроса в AutoRia
    for (const user of users) {
      const { chatId, searchSettings } = user;
      const { brand, model, year } = JSON.parse(searchSettings);
      const apiKey = process.env.RIA_API_KEY;

      console.log(`Searching cars for user with chatId ${chatId}`);
      console.log(`Search settings: brand=${brand}, model=${model}, year=${year}`);

      // Запрос к API AutoRia
      const apiUrl = `https://api.auto.ria.com/brands/${brand}/models/${model}/years/${year}?api_key=${apiKey}`;
      const response = await axios.get(apiUrl);
      const data = response.data;
      const results = data.map((car) => {
        return `Марка: ${car.brand}, Модель: ${car.model}, Рік випуску: ${car.year}`;
      });

      console.log(`Found ${results.length} cars for user with chatId ${chatId}`);

      // Отправка уведомления в Telegram
      function sendMessageTelegram(message, chatId, botToken) {
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        
        const options = {
          url: telegramUrl,
          method: 'POST',
          json: true,
          body: {
            chat_id: chatId,
            text: message,
          },
        };

        request(options, (error, response, body) => {
          if (!error && response.statusCode === 200) {
            console.log('Повідомлення відправлено!');
          } else {
            console.error('Помилка при відправленні повідомлення:', error);
          }
        });
      }
    
      // Использование функции для отправки уведомления
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
    }	
  }
};
