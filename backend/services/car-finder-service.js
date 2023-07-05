const { getScanResult, updateItem } = require('../repositories/account.repository');
const { sendTelegramMessage } = require('../clients/telegram.client');
const { getCarDetails } = require('../clients/auto-ria.client');

module.exports.handler = async (event) => {
  try {
    const scanResult = await getScanResult();
    console.log('scanResult:', scanResult);

    const users = scanResult.map(function (item) {
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
        : { lastScanIds: [] };

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

    const telegramChatIds = scanResult.map((item) => item.telegramChatId.S);
    console.log('telegramChatIds:', telegramChatIds);

    const apiKey = process.env.RIA_API_KEY;

    for (const user of users) {
      const { telegramChatId, id: userId, updateVehicleIdData, searchParams } = user;
      console.log("user", user);

      const updatedIds = [];

      if (searchParams) {
        console.log('searchParams', searchParams);

        const cars = await getCarDetails(apiKey, searchParams);
        console.log('cars:', cars);

        for (const id of cars) {
          console.log('id', id);

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

      await updateItem(userId, updatedIds);
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
