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

    const users = scanResult.Items.map(function (item) {
      const {
        searchParams: {
          M: {
            poYers: { S: poYers },
            markaId: { S: markaId },
            modelId: { S: modelId },
            categoryId: { S: categoryId },
            sYers: { S: sYers }
          }
        }
      } = item;

      const updateVehicleIdData = item.updateVehicleIdData
    ? JSON.parse(item.updateVehicleIdData.S)
    : { lastScanIds: [] }; // Initialize as an empty array if it's not present
    
      return {
        telegramChatId: item.telegramChatId.S,
        lastname: item.lastname.S,
        firstname: item.firstname.S,
        username: item.username.S,
        id: item.id.S,
        updateVehicleIdData,
        searchParams: {
          poYers,
          markaId,
          modelId,
          categoryId,
          sYers
        }
      };
    });
    
    console.log('users:', users);

    const telegramChatIds = scanResult.Items.map((item) => item.telegramChatId.S);
    console.log('telegramChatIds:', telegramChatIds);

    const apiKey = process.env.RIA_API_KEY;

    for (const user of users) {
      const { telegramChatId, id: userId, updateVehicleIdData, searchParams } = user;
      console.log("user", user);
      
      const updatedIds = [...updateVehicleIdData.lastScanIds]; // Создаем копию текущего списка
      console.log("updatedIds", updatedIds);

      // Check if user has searchParams defined
      if (searchParams) {
        console.log('searchParams', searchParams);
        const { categoryId, markaId, modelId, sYers, poYers } = searchParams;

        // Build the API URL with user-specific search parameters
        const url = `https://developers.ria.com/auto/search`;

        const response = await axios.get(url, {
          params: {
            api_key: apiKey,
            'category_id[0]': categoryId,
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
        for (const id of cars) {
          console.log('id', id);

          const carLink = `https://auto.ria.com/uk/auto___${id}.html`;
          console.log('carLink', carLink);

          if (!updateVehicleIdData.lastScanIds.includes(id)) {
            const telegramMessage = `Found car: ${carLink}`;
            console.log('telegramMessage', telegramMessage);

            await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
              chat_id: telegramChatId,
              text: telegramMessage,
            });

            updatedIds.push(id); // Add the new id to the list
          }
        }
      }

      // Обновляем запись пользователя в DynamoDB, включая обновленное поле autoriaIdsUser
      const updateItemCommand = new UpdateItemCommand({
        TableName: 'riabatat-dev-users',
        Key: {
          id: { S: userId },
        },
        UpdateExpression: 'SET updateVehicleIdData = :updateVehicleIdDataValue',
        ExpressionAttributeValues: {
          ':updateVehicleIdDataValue': { S: JSON.stringify({ lastScanIds: updatedIds }) },
        },
      });

      await client.send(updateItemCommand);
    }
  } catch (error) {
    console.log('Error:', error.message);
    console.log('ErrorStack:', error.stack);
    if (error.response) {
      console.log('responseData,', error.response.data);
      console.log('response status', error.response.status);
    }
    throw error;
  }
};