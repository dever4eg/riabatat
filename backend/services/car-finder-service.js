const { getUsers, createUser } = require('../repositories/account.repository');
const { sendTelegramMessage } = require('../clients/telegram.client');
const { getCarDetails } = require('../clients/auto-ria.client');

module.exports.handler = async (event) => {
  try {
    const scanResult = await getUsers();
    console.log('scanResult:', scanResult);

    const users = scanResult.map((item) => {
      const {
        searchParams: {
          M: {
            poYers: { S: poYers },
            markaId: { S: markaId },
            modelId: { S: modelId },
            categoryId: { S: categoryId },
            sYers: { S: sYers },
          },
        },
        telegramChatId: { S: telegramChatId },
        lastname: { S: lastname },
        firstname: { S: firstname },
        username: { S: username },
        id: { S: userId },
        updateVehicleIdData: { S: updateVehicleIdDataStr },
      } = item;

      const updateVehicleIdData = updateVehicleIdDataStr ? JSON.parse(updateVehicleIdDataStr) : { lastScanIds: [] };

      return {
        telegramChatId,
        lastname,
        firstname,
        username,
        userId,
        updateVehicleIdData,
        searchParams: {
          poYers,
          markaId,
          modelId,
          categoryId,
          sYers,
        },
      };
    });

    console.log('users:', users);

    const telegramChatIds = scanResult.map((item) => item.telegramChatId.S);
    console.log('telegramChatIds:', telegramChatIds);

    const apiKey = process.env.RIA_API_KEY;

    for (const user of users) {
      const { telegramChatId, userId, updateVehicleIdData, searchParams } = user;
      console.log('user', user);

      const updatedIds = [];

      if (searchParams) {
        console.log('searchParams', searchParams);

        const cars = await getCarDetails(apiKey, searchParams);
        console.log('cars:', cars);

        for (const id of cars) {
          console.log('id', id);

          if (id.length === 8) { 
            const carLink = `https://auto.ria.com/uk/auto___${id}.html`;
            console.log('carLink', carLink);
          
            if (!updateVehicleIdData.lastScanIds.includes(id)) {
              const telegramMessage = `Found car: ${carLink}`;
              console.log('telegramMessage', telegramMessage);

              await sendTelegramMessage(telegramChatId, process.env.TELEGRAM_TOKEN, telegramMessage);

              updatedIds.push(id);

              if (updatedIds.length >= 10) {
                break;
              }
            }
          }
        }
      }
      await createUser(userId, updatedIds);
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
