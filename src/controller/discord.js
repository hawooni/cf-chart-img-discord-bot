import { InteractionResponseType, InteractionType, InteractionResponseFlags, verifyKey } from 'discord-interactions'
import { patchPriceInteraction, patchChartInteraction } from '../service/discord'
import { getInviteURL } from '../helper/discord'
import { JsonResponse } from '../helper/response'
import { INVITE, PRICE, CHART } from '../enum/commands'

export const webhook = async (req, env, event) => {
  const { DEBUG, DISCORD_APPLICATION_ID } = env
  const { type, data, token } = await req.json()

  if (type === InteractionType.PING) {
    DEBUG && console.log(':: debug :: discord :: webhook payload type :: PING')
    return new JsonResponse({ type: InteractionResponseType.PONG })
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    DEBUG && console.log(':: debug :: discord :: webhook payload type :: APPLICATION_COMMAND')

    if (data.name === INVITE.name) {
      DEBUG && console.log(':: debug :: discord :: webhook payload type :: /invite')
      return new JsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: getInviteURL(DISCORD_APPLICATION_ID),
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      })
    }

    if (data.name === PRICE.name) {
      DEBUG && console.log(':: debug :: discord :: webhook payload type :: /price')
      event.waitUntil(patchPriceInteraction(data, token, env)) // patch deferred message with the source

      return new JsonResponse({
        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      })
    }

    if (data.name === CHART.name) {
      DEBUG && console.log(':: debug :: discord :: webhook payload type :: /chart')
      event.waitUntil(patchChartInteraction(data, token, env)) // patch deferred message with the source

      return new JsonResponse({
        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      })
    }
  }

  DEBUG && console.log(`:: debug :: discord :: webhook payload type (${type}) is not supported`)
  return new JsonResponse({ error: 'The payload type is not supported.' }, { status: 400 })
}

export const verifySignature = async (req, env) => {
  const { DEBUG, DISCORD_PUBLIC_KEY } = env

  if (req.method === 'POST') {
    DEBUG && console.log(':: debug :: discord :: verify payload signature')

    if (DISCORD_PUBLIC_KEY) {
      const signature = req.headers.get('x-signature-ed25519')
      const timestamp = req.headers.get('x-signature-timestamp')
      const body = await req.clone().arrayBuffer()

      if (verifyKey(body, signature, timestamp, DISCORD_PUBLIC_KEY)) {
        DEBUG && console.log(':: debug :: discord :: webhook payload signature verifyKey success')
      } else {
        DEBUG && console.log(':: error :: discord :: webhook payload signature verifyKey failed')
        return new JsonResponse({ error: 'The server signature verification failed.' }, { status: 401 })
      }
    } else {
      console.log(':: error :: discrod :: DISCORD_PUBLIC_KEY is required')
      return new JsonResponse({ error: 'The server has encountered a configuration error.' }, { status: 500 })
    }
  }
}
