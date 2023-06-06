const axios = require("axios");
const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: 'eu-central-1' });

module.exports.handler = async (event) => {
  try {
    // Assuming you have the `id_оголошення` value
    const autoId = "32964882";
    const apiKey = "";
    const url = `https://developers.ria.com/auto/info?api_key=${apiKey}&auto_id=${autoId}`;

    // Make a GET request to the API
    const response = await axios.get(url);

    // Assuming the API response contains car details
    const car = response.data;

    // Print the car details
    console.log(car);
  } catch (error) {
    console.error("Error:", error);
  }
};
