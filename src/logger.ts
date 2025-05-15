import pino from 'pino'

export const logger = pino({
  level: 'info',
  // Remova o transport para evitar o erro
  // transport: {
  //   target: 'pino-pretty',
  //   options: {
  //     colorize: true
  //   }
  // }
})
