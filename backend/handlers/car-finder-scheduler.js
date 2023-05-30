const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const request = require("request");

const client = new DynamoDBClient({ region: 'eu-central-1' });

module.exports.handler = async (event) => {
  try {
    const brand = 'mazda'; 
    const model = 'cx-5';
    const year = '2020';
    const apiKey = process.env.RIA_API_KEY; 

    // Запит до API Autoria
    const apiUrl = `https://api.auto.ria.com/brands/${brand}/models/${model}/years/${year}?api_key=${apiKey}`;

    // Виконання запиту до API Autoria
    request(apiUrl, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const data = JSON.parse(body);
        const results = data.map((car) => {
          return `Марка: ${car.brand}, Модель: ${car.model}, Рік випуску: ${car.year}`;
        });        
      
        //функція відправки повідомлення в телеграм
        function sendMassageTelegram(message, chatId, botToken) {
          const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message}`;
        
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
              console.log('Сообщение отправленно!');
            } else {
              console.error('Сообщение не отправленно:', error);
            }
          });
        }
      
      //Використання функції для відправки повідомлення
      const message = results.join('\n');
      



        return {
          statusCode: 200,
          body: JSON.stringify({
            
          }),
        };
      } else {
        console.error('Помилка при отриманні даних з API Autoria:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: 'Виникла помилка при отриманні даних',
          }),
        };
      }
    });
  } catch (error) {
    console.error('Сталася помилка:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Виникла помилка',
      }),
    };
  }
};
