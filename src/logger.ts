import pino, { LoggerOptions } from 'pino'

const options: LoggerOptions = {
  transport: {
    target: 'pino-pretty'
  },
  level: 'info'
}

export const logger = pino(options)
