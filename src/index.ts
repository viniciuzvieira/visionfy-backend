import Fastify, { FastifyRequest, FastifyReply } from 'fastify'
import awsLambdaFastify from '@fastify/aws-lambda'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import dotenv from 'dotenv'

import { userRoutes } from './routes/user.routes'
import { logger } from './logger'

dotenv.config()

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined in environment variables')
}

const app = Fastify({ logger })

// Middlewares
app.register(cors)
app.register(jwt, {
  secret: jwtSecret
})

// Swagger
app.register(swagger, {
  openapi: {
    info: {
      title: 'Visionfy API',
      version: '1.0.0'
    }
  }
})
app.register(swaggerUI)

// JWT Auth Decorator
app.decorate('authenticate', async function (
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.code(401).send({ message: 'Unauthorized', error: err })
  }
})

// Rotas
app.register(userRoutes, { prefix: '/users' })

// ✅ Exporta o handler AWS para uso com Serverless Framework
export const handler = awsLambdaFastify(app)

// 👇 Apenas roda localmente com `npm run dev`
if (require.main === module) {
  const port = Number(process.env.PORT) || 4000
  app.listen({ port }, (err, address) => {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }
    app.log.info(`🚀 Server listening at ${address}`)
  })
}
