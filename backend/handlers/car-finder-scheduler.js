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
    const car = response.data;

    // Print the car details
    console.log(car);
  } catch (error) {
    console.log('Error:', error.message);
    if (error.response) {
      console.log('responseData,', error.response.data);
      console.log('response status',error.response.status);
    } 
  }
};
