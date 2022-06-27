import fs from 'fs'
import toml from 'toml'
import axios from 'axios'

import { THEMES } from '../src/enum/tradingview.js'
import { INVITE, PRICE } from '../src/enum/commands.js'

import config from '../config.json' assert { type: 'json' }

const env = process.argv[3] // eg. node src/setup.js --env production | undefined
const wrangler = toml.parse(fs.readFileSync('./wrangler.toml', 'utf-8'))

const { DISCORD_APPLICATION_ID, DISCORD_TOKEN } = env ? wrangler.env[env].vars : wrangler.vars

setupConfigPrice()

putRegisterCommands('commands', [INVITE, PRICE]).catch((error) => {
  if (error.response?.data) {
    const { code, message, errors } = error.response.data
    console.error(JSON.stringify(errors))
    console.error(`${message} ${code ? code : ''}`)
  }
})

/**
 * warn: modify enum commands price
 */
function setupConfigPrice() {
  PRICE.options = [
    {
      name: 'source',
      description: 'Tradingview Price Source',
      type: 2,
      options: config.sources.map((source) => {
        return {
          name: source.name,
          description: source.description,
          type: 1,
          options: [
            {
              name: 'symbol',
              description: 'Tradingview price symbol',
              type: 3,
              required: true,
              choices: source.inputs.map((input) => {
                return {
                  name: input.name,
                  value: input.symbol,
                }
              }),
            },
            {
              name: 'interval',
              description: 'Tradingview price interval',
              type: 3,
              required: false,
              choices: config.price.intervals.map((interval) => {
                return {
                  name: interval,
                  value: interval,
                }
              }),
            },
            {
              name: 'theme',
              description: 'Tradingview price theme',
              type: 3,
              required: false,
              choices: THEMES,
            },
          ],
        }
      }),
    },
  ]
}

/**
 * @param {String} method
 * @param {Object} payload
 * @returns {Promise}
 */
function putRegisterCommands(method, payload) {
  return axios.put(`https://discord.com/api/v10/applications/${DISCORD_APPLICATION_ID}/${method}`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${DISCORD_TOKEN}`,
    },
  })
}
