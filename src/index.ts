import Fastify from 'fastify'
import awsLambdaFastify from '@fastify/aws-lambda'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import dotenv from 'dotenv'
import { userRoutes } from './routes/user.routes'

dotenv.config()

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined')
}

const app = Fastify() // logger removido por conflito de tipos

app.register(cors)

app.register(jwt, { secret: jwtSecret })

app.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.code(401).send({ message: 'Unauthorized', error: err })
  }
})

app.register(swagger, {
  openapi: {
    info: {
      title: 'Visionfy API',
      version: '1.0.0'
    }
  }
})

app.register(swaggerUI)

app.register(userRoutes, { prefix: '/users' })

export const handler = awsLambdaFastify(app)

// Execução local
if (require.main === module) {
  const port = Number(process.env.PORT) || 4000
  app.listen({ port }, (err, address) => {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }
    console.log(`🚀 Server running at ${address}`)
  })
}
