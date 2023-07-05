// module2.js
const axios = require("axios");

async function sendTelegramMessage(telegramChatId, telegramToken, telegramMessage) {
  await axios.post(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
    chat_id: telegramChatId,
    text: telegramMessage,
  });
}

module.exports = {
  sendTelegramMessage
};
