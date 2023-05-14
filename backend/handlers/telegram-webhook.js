module.exports.handler = async (event) => {
  console.log('telegram event', event)

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Update settings endpoint',
        input: event,
      },
      null,
      2
    ),
  };
};
