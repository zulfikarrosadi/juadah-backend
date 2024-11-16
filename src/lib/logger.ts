import { AsyncLocalStorage } from 'node:async_hooks'
import pino from 'pino'
import 'dotenv/config'

const pinoConfig = pino({
  level: process.env.PINO_LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() }
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})

type Level = 'info' | 'error' | 'warn'
type Layer = 'repository' | 'service' | 'handler'
type LoggerContext = {
  operationId: string
  layer: Layer
  requestId?: string
  userId?: number
}

function logger(
  level: Level,
  message: string,
  layer: Layer,
  operationId: string,
  context?: LoggerContext,
) {
  if (context) {
    pinoConfig[level]({
      message,
      context: {
        operationId: operationId,
        layer: layer,
        userId: context?.userId,
        requestId: context?.requestId,
      },
    })
  }
  pinoConfig[level]({ message, layer, operationId })
}

const asyncLocalStorage = new AsyncLocalStorage<LoggerContext>()

export function getContext() {
  return asyncLocalStorage.getStore()
}

export type Logger = (
  level: Level,
  message: string,
  layer: Layer,
  operationId: string,
  context?: LoggerContext,
) => void

export default logger
