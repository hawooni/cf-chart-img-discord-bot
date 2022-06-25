import { InteractionResponseType } from 'discord-interactions'
import { patchInteractionJson, patchInteractionFormData } from '../helper/discord'
import { price as PRICE, message as MESSAGE } from '../../config'
import {
  getTradingViewMiniChart as getPriceImage,
  getTradingViewAdvancedChart as getChartImage,
} from '../helper/chartimg'

export const patchPriceInteraction = async (data, token, env) => {
  const { DISCORD_APPLICATION_ID, CHART_IMG_API_KEY } = env

  const query = getPriceQuery(data)
  const resImage = await getPriceImage(query, CHART_IMG_API_KEY)

  if (resImage.status === 200) {
    return patchInteractionAttachImage(
      DISCORD_APPLICATION_ID,
      token,
      new Blob([await resImage.arrayBuffer()], { type: 'application/octet-stream' }),
      getPriceCaption(query)
    )
  } else {
    return patchInteractionJson(DISCORD_APPLICATION_ID, token, {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      content: getErrorMessage(resImage.status, await resImage.json()),
    })
  }
}

/**
 * @param {Object} data
 * @returns {Object}
 */
function getPriceQuery(data) {
  const optSymbol = data.options?.find((opt) => opt.name === 'symbol')
  const optInterval = data.options?.find((opt) => opt.name === 'interval')
  const optTheme = data.options?.find((opt) => opt.name === 'theme')

  return Object.assign(
    {},
    PRICE.default,
    optSymbol ? { symbol: optSymbol.value } : null,
    optInterval ? { interval: optInterval.value } : null,
    optTheme ? { theme: optTheme.value } : null
  )
}

/**
 * @param {Object} query
 * @returns {String}
 */
function getPriceCaption(query) {
  return `${query.symbol.toUpperCase()} ${query.interval}`
}

/**
 * @param {String} appId
 * @param {String} token
 * @param {Blob} attachImage
 * @param {String} caption
 * @returns {Promise}
 */
function patchInteractionAttachImage(appId, token, attachImage, caption) {
  const formData = new FormData()
  const payload = {
    embeds: [
      {
        image: {
          url: 'attachment://attach0.png',
        },
        footer: {
          text: caption,
        },
      },
    ],
    attachments: [
      {
        id: 0,
        filename: 'attach0.png',
      },
    ],
  }

  formData.append('files[0]', attachImage)
  formData.append('payload_json', JSON.stringify(payload))

  return patchInteractionFormData(appId, token, formData)
}

/**
 * @param {Integer} status
 * @param {Object|undefined} payload
 * @returns {String}
 */
function getErrorMessage(status, payload) {
  console.error(`getErrorMessage(${status}, payload)`)
  payload && console.error(payload)

  if (status === 422) {
    return (payload && payload.error) || MESSAGE.invalid
  } else if (status === 429) {
    return (payload && payload.error) || MESSAGE.rateLimit
  } else {
    return MESSAGE.error
  }
}
