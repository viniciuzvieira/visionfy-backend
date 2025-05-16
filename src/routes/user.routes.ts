import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { FastifyInstance } from 'fastify'

const prisma = new PrismaClient()

export async function userRoutes(app: FastifyInstance) {
  const anyApp = app as any // 👈 bypass do TypeScript

  app.post('/register', async (request: any, reply: any) => {
    const bodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6)
    })

    const { name, email, password } = bodySchema.parse(request.body)

    const userExists = await prisma.user.findUnique({ where: { email } })
    if (userExists) {
      return reply.code(400).send({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    })

    return reply.code(201).send({
      user: { id: user.id, name: user.name, email: user.email }
    })
  })

  app.post('/login', async (request: any, reply: any) => {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string()
    })

    const { email, password } = bodySchema.parse(request.body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return reply.code(401).send({ message: 'Invalid credentials' })
    }

    const token = app.jwt.sign({ id: user.id, name: user.name })

    return reply.send({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    })
  })

  app.get('/', { preHandler: [anyApp.authenticate] }, async (_request: any, reply: any) => {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true }
    })
    return reply.send(users)
  })
}
