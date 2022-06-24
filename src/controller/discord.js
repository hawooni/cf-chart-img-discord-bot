import { InteractionResponseType, InteractionType, verifyKey } from 'discord-interactions'
import { JsonResponse } from '../helper/response'
import { appCommand } from '../service/discord'
import { message as MESSAGE } from '../../config'

export const webhook = (req, env) => {
  const { DEBUG } = env

  return req
    .json()
    .then((payload) => {
      const { type } = payload

      if (type === InteractionType.PING) {
        DEBUG && console.log(':: debug :: discord :: webhook payload type :: PING')
        return new JsonResponse({ type: InteractionResponseType.PONG })
      }

      if (type === InteractionType.APPLICATION_COMMAND) {
        DEBUG && console.log(':: debug :: discord :: webhook payload type :: APPLICATION_COMMAND')
        return appCommand(payload, env)
      }

      DEBUG && console.log(`:: debug :: discord :: webhook payload type (${type}) is not supported`)
      return new JsonResponse({ error: 'The payload type is not supported.' }, { status: 400 })
    })
    .catch((error) => {
      if (DEBUG) {
        throw error
      } else {
        console.log(error)
        return new JsonResponse({ error: MESSAGE.error }, { status: 500 })
      }
    })
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
        console.log(':: debug :: discord :: webhook payload signature verifyKey success')
      } else {
        console.log(':: error :: discord :: webhook payload signature verifyKey failed')
        return new JsonResponse({ error: 'The server signature verification failed.' }, { status: 401 })
      }
    } else {
      console.log(':: error :: discrod :: DISCORD_PUBLIC_KEY is required')
      return new JsonResponse({ error: 'The server has encountered a configuration error.' }, { status: 500 })
    }
  }
}
