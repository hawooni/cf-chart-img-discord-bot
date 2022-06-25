import qs from 'qs'

const BASE_URL = 'https://api.chart-img.com/v1'

/**
 * @param {Object} query
 * @param {String} apiKey
 * @returns {Promise}
 */
export const getTradingViewMiniChart = (query = {}, apiKey) => {
  return getFetch(`/tradingview/mini-chart?${qs.stringify(query)}`, apiKey)
}

/**
 * @param {Object} query
 * @param {String} apiKey
 * @returns {Promise}
 */
export const getTradingViewAdvancedChart = (query = {}, apiKey) => {
  return getFetch(`/tradingview/advanced-chart?${qs.stringify(query, { arrayFormat: 'repeat' })}`, apiKey)
}

/**
 * @param {String} path
 * @param {String} apiKey
 * @returns {Promise}
 */
function getFetch(path, apiKey) {
  return fetch(BASE_URL + path, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${apiKey}`,
    },
  })
}
