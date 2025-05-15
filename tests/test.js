import Fastify from 'fastify'

const app = Fastify()

app.authenticate // <-- se o TS não reclamar, o tipo foi reconhecido ✅
