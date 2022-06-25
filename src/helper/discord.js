const BASE_URL = 'https://discord.com/api/v10'

/**
 * @param {String} appId
 * @returns {String}
 */
export const getInviteURL = (appId) => {
  return `https://discord.com/oauth2/authorize?client_id=${appId}&scope=applications.commands`
}

/**
 * @param {String} appId
 * @param {String} token
 * @param {Object} payload
 * @returns {Promise}
 */
export const patchInteractionJson = (appId, token, payload) => {
  return fetch(`${BASE_URL}/webhooks/${appId}/${token}/messages/@original`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

/**
 * @param {String} appId
 * @param {String} token
 * @param {FormData} formData
 * @returns {Promise}
 */
export const patchInteractionFormData = (appId, token, formData) => {
  return fetch(`${BASE_URL}/webhooks/${appId}/${token}/messages/@original`, {
    method: 'PATCH',
    body: formData,
  })
}
