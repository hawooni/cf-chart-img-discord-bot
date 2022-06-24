import { JsonResponse } from '../helper/response'
import { InteractionType, InteractionResponseType } from '../helper/interaction'
import { message as MESSAGE } from '../../config'
import { appCommand } from '../service/discord'

export const webhook = (req, env) => {
  const { DEBUG } = env

  return req
    .json()
    .then((payload) => {
      const { type } = payload

      if (type === InteractionType.PING) {
        DEBUG && console.log(':: debug :: discord :: payload type :: PING')
        return new JsonResponse({ type: InteractionResponseType.PONG })
      }

      if (type === InteractionType.APPLICATION_COMMAND) {
        DEBUG && console.log(':: debug :: discord :: payload type :: APPLICATION_COMMAND')
        return appCommand(payload, env)
      }

      return new JsonResponse({ error: `Payload type is not supported.` }, { status: 400 })
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

      // todo: verify signature
    } else {
      console.log(':: error :: environment variable DISCORD_PUBLIC_KEY is required')
      return new JsonResponse({ error: 'The server has encountered a configuration error.' }, { status: 500 })
    }
  }
}
