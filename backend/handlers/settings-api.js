module.exports.update = async (event) => {
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: 'Settings api response',
          input: event,
        },
        null,
        2
      ),
    };
  };
  