import { Router } from 'itty-router'
import { JsonResponse } from './helper/response'
import { verifySignature, webhook } from './controller/discord'

const router = Router()

router.post('/', verifySignature, webhook)

router.all('/*', () => new JsonResponse({ message: 'Route not found!' }, { status: 404 }))

export default {
  async fetch(req, env, event) {
    return router.handle(req, env, event)
  },
}
