import Fastify, { FastifyRequest, FastifyReply } from 'fastify'
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

// Register plugins
app.register(cors)
app.register(jwt, {
  secret: jwtSecret
})

// Register Swagger
app.register(swagger, {
  openapi: {
    info: {
      title: 'Visionfy API',
      version: '1.0.0'
    }
  }
})
app.register(swaggerUI)

// JWT middleware inline
const verifyJWT = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.code(401).send({ message: 'Unauthorized' })
  }
}

// Decorate so we can use app.verifyJWT
app.decorate('verifyJWT', verifyJWT)

// Register routes
app.register(userRoutes, { prefix: '/users' })

// Start server
const port = Number(process.env.PORT) || 4000
app.listen({ port }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`🚀 Server listening at ${address}`)
})

// TypeScript fix to allow using verifyJWT
declare module 'fastify' {
  interface FastifyInstance {
    verifyJWT: typeof verifyJWT
  }
}
