import fs from 'fs'
import toml from 'toml'
import axios from 'axios'

import { INVITE, PRICE, CHART } from '../src/enum/commands.js'

import config from '../config.json' assert { type: 'json' }

const env = process.argv[3] // eg. node src/setup.js --env production | undefined
const wrangler = toml.parse(fs.readFileSync('./wrangler.toml', 'utf-8'))

const { DISCORD_APPLICATION_ID, DISCORD_TOKEN } = env ? wrangler.env[env].vars : wrangler.vars

setupConfigPrice(PRICE)

apiPutRegisterCommands('commands', [INVITE, PRICE, CHART]).catch((error) => {
  if (error.response?.data) {
    const { code, message, errors } = error.response.data
    console.error(JSON.stringify(errors))
    console.error(`${message} ${code ? code : ''}`)
  }
})

/**
 * @param {Object} price
 */
function setupConfigPrice(price) {
  price.type = 1
  price.options = [
    {
      name: 'symbol',
      description: 'Tradingview symbol',
      type: 3,
      required: false,
      choices: config.price.inputs.map((input) => {
        return {
          name: input.name,
          value: input.symbol,
        }
      }),
    },
    {
      name: 'interval',
      description: 'Tradingview interval',
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
      description: 'Tradingview theme',
      type: 3,
      required: false,
      choices: [
        {
          name: 'Dark',
          value: 'dark',
        },
        {
          name: 'Light',
          value: 'light',
        },
      ],
    },
  ]
}

/**
 * @param {String} method
 * @param {Object} payload
 * @returns {Promise}
 */
function apiPutRegisterCommands(method, payload) {
  return axios.put(`https://discord.com/api/v10/applications/${DISCORD_APPLICATION_ID}/${method}`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${DISCORD_TOKEN}`,
    },
  })
}
