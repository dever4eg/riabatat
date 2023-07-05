const axios = require("axios");

async function getCarDetails(apiKey, searchParams) {
  const { categoryId, markaId, modelId, sYers, poYers } = searchParams;

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

  return response.data.result.search_result.ids;
}

module.exports = {
  getCarDetails
};