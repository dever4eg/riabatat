const { DynamoDBClient, ScanCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: 'eu-central-1' });

async function getScanResult() {
  const scanCommand = new ScanCommand({
    TableName: 'riabatat-dev-users',
  });

  const scanResult = await client.send(scanCommand);
  return scanResult.Items;
}

async function updateItem(userId, updatedIds) {
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

module.exports = {
  getScanResult,
  updateItem
};
