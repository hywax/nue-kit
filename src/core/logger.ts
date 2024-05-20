import type { BaseLogger } from 'pino'
import { pino } from 'pino'

export const logger: BaseLogger = pino()
