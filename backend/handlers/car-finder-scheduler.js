module.exports.handler = async (event) => {
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: 'Scheduler',
          input: event,
        },
        null,
        2
      ),
    };
  };
  