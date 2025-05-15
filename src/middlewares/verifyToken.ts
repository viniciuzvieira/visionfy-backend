import { FastifyRequest, FastifyReply } from 'fastify'

export async function verifyToken(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.code(401).send({ message: 'Unauthorized', error: err })
  }
}
