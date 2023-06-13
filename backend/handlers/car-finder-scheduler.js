const axios = require("axios");
const { DynamoDBClient, ScanCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");

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
        id: item.id.S,
        updateVehicleIdData: item.updateVehicleIdData ? JSON.parse(item.updateVehicleIdData.S) : { lastScanIds: [] }
      };
    });

    console.log('users:', users);

    const telegramChatIds = scanResult.Items.map((item) => item.telegramChatId.S);
    
    console.log('telegramChatIds:', telegramChatIds);

    // Assuming you have the `id_оголошення` value
    const markaId = "9";
    const modelId = "3219";
    const sYers = "2010";
    const poYers = "2023";
    
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
        'po_yers[0]': poYers,
        'top': 9,
      },
    });

    // Assuming the API response contains car details in a property called "cars"
    const cars = response.data.result.search_result.ids;
    
    console.log('cars:', cars);

    // Send found cars to Telegram chat
    for (const user of users) {
      const { telegramChatId, id: userId, updateVehicleIdData } = user;
      const updatedIds = [...updateVehicleIdData.lastScanIds]; // Создаем копию текущего списка

      for (const id of cars) {
        const carLink = `https://auto.ria.com/uk/auto___${id}.html`;
        
        if (!updateVehicleIdData.lastScanIds.includes(id)) {
          const telegramMessage = `Found car: ${carLink}`;
          
          await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: telegramChatId,
            text: telegramMessage
          }); 

          updatedIds.push(id); // Добавляем новый id в список
        }
      }

      // Обновляем запись пользователя в DynamoDB, включая обновленное поле autoriaIdsUser
      const updateItemCommand = new UpdateItemCommand({
        TableName: 'riabatat-dev-users',
        Key: {
          id: { S: userId },
        },
        UpdateExpression: "SET updateVehicleIdData = :updateVehicleIdDataValue",
        ExpressionAttributeValues: {
          ":updateVehicleIdDataValue": { S: JSON.stringify({ lastScanIds: updatedIds }) }
        }
      });
      await client.send(updateItemCommand);
    }
  } catch (error) {
    console.log('Error:', error.message);
    if (error.response) {
      console.log('responseData,', error.response.data);
      console.log('response status', error.response.status);
    }
  }
};
