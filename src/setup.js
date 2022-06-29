import fs from 'fs'
import toml from 'toml'
import axios from 'axios'
import inquirer from 'inquirer'

import { INVITE, PRICE, CHART } from '../src/enum/commands.js'
import { THEMES, ADVANCED_STYLES } from '../src/enum/tradingview.js'

import config from '../config.json' assert { type: 'json' }

const env = process.argv[3] // eg. node src/setup.js --env production | undefined
const wrangler = toml.parse(fs.readFileSync('./wrangler.toml', 'utf-8'))

const { DISCORD_APPLICATION_ID } = env ? wrangler.env[env].vars : wrangler.vars

const PRICE_INTERVALS = config.price.intervals.map((interval) => {
  return {
    name: interval,
    value: interval,
  }
})

const CHART_INTERVALS = config.chart.intervals.map((interval) => {
  return {
    name: interval,
    value: interval,
  }
})

if (DISCORD_APPLICATION_ID && DISCORD_APPLICATION_ID.length > 0) {
  inquirer
    .prompt([
      {
        type: 'password',
        name: 'token',
        message: 'Enter DISCORD_TOKEN secret value : ',
      },
    ])
    .then((answer) => {
      setupConfigPrice()
      setupConfigChart()
      return putRegisterCommands('commands', [INVITE, PRICE, CHART], answer.token)
    })
    .catch((error) => {
      if (error.response?.data) {
        const { code, message, errors } = error.response.data
        errors && console.error(JSON.stringify(errors))
        console.error(`${message} ${code ? code : ''}`)
      } else {
        console.error(error.message || error)
      }
    })
} else {
  console.error('wrangler.toml DISCORD_APPLICATION_ID value is required.')
}

/**
 * warn: modify enum commands price
 */
function setupConfigPrice() {
  PRICE.options = [
    {
      name: 'query',
      description: 'Tradingview Query',
      type: 1,
      options: [
        {
          name: 'symbol',
          description: 'Tradingview Price symbols',
          type: 3,
          required: true,
        },
        {
          name: 'interval',
          description: 'Tradingview Price Intervals',
          type: 3,
          required: false,
          choices: PRICE_INTERVALS,
        },
        {
          name: 'theme',
          description: 'Tradingview Price Themes',
          type: 3,
          required: false,
          choices: THEMES,
        },
      ],
    },
    ...config.presets.map((preset) => {
      return {
        name: preset.name,
        description: preset.description,
        type: 1,
        options: [
          {
            name: 'symbol',
            description: 'Tradingview Price symbols',
            type: 3,
            required: true,
            choices: preset.inputs.map((input) => {
              return {
                name: input.name,
                value: input.symbol,
              }
            }),
          },
          {
            name: 'interval',
            description: 'Tradingview Price Intervals',
            type: 3,
            required: false,
            choices: PRICE_INTERVALS,
          },
          {
            name: 'theme',
            description: 'Tradingview Price Themes',
            type: 3,
            required: false,
            choices: THEMES,
          },
        ],
      }
    }),
  ]
}

/**
 * warn: modify enum commands chart
 */
function setupConfigChart() {
  CHART.options = [
    {
      name: 'query',
      description: 'Tradingview Query',
      type: 1,
      options: [
        {
          name: 'symbol',
          description: 'Tradingview Chart Symbols',
          type: 3,
          required: true,
        },
        {
          name: 'interval',
          description: 'Tradingview Chart Intervals',
          type: 3,
          required: false,
          choices: CHART_INTERVALS,
        },
        {
          name: 'studies',
          description: 'Tradingview Chart Studies',
          type: 3,
          required: false,
        },
        {
          name: 'style',
          description: 'Tradingview Chart Styles',
          type: 3,
          required: false,
          choices: ADVANCED_STYLES,
        },
        {
          name: 'theme',
          description: 'Tradingview Chart Themes',
          type: 3,
          required: false,
          choices: THEMES,
        },
      ],
    },
    ...config.presets.map((preset) => {
      return {
        name: preset.name,
        description: preset.description,
        type: 1,
        options: [
          {
            name: 'symbol',
            description: 'Tradingview Chart Symbols',
            type: 3,
            required: true,
            choices: preset.inputs.map((input) => {
              return {
                name: input.name,
                value: input.symbol,
              }
            }),
          },
          {
            name: 'interval',
            description: 'Tradingview Chart Intervals',
            type: 3,
            required: false,
            choices: CHART_INTERVALS,
          },
          {
            name: 'studies',
            description: 'Tradingview Chart Studies',
            type: 3,
            required: false,
            choices: config.chart.studies,
          },
          {
            name: 'style',
            description: 'Tradingview Chart Styles',
            type: 3,
            required: false,
            choices: ADVANCED_STYLES,
          },
          {
            name: 'theme',
            description: 'Tradingview Chart Themes',
            type: 3,
            required: false,
            choices: THEMES,
          },
        ],
      }
    }),
  ]
}

/**
 * @param {String} method
 * @param {Object} payload
 * @param {String} token
 * @returns {Promise}
 */
function putRegisterCommands(method, payload, token) {
  return axios.put(`https://discord.com/api/v10/applications/${DISCORD_APPLICATION_ID}/${method}`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${token}`,
    },
  })
}
