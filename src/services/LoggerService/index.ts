import { createLogger } from 'bunyan'
import { Logtail } from '@logtail/node'
import { Context } from '@logtail/types'
import { inspect } from 'util'
import { LogtailLogType } from './logtailLogType'

export class LoggerService {
  private static local = createLogger({ name: 'Academi' })
  private static logtail: Logtail

  static initialize() {
    const logtailToken = process.env['LOGTAIL']
    if (logtailToken == null) throw new Error('Logtail Token is null')

    LoggerService.logtail = new Logtail(logtailToken)
  }

  static async sendLogtail(type: LogtailLogType, context?: Context): Promise<void> {
    if (process.env.NODE_ENV == 'production') {
      await LoggerService.logtail.info(type, context)
    } else {
      LoggerService.log(`type: ${type}, context: ${JSON.stringify(context)}`)
    }
  }

  public static debug(text: string) {
    LoggerService.local.debug(text)
  }

  public static error(text: string) {
    LoggerService.local.error(text)
  }

  public static info(text: string) {
    LoggerService.local.info(text)
  }

  public static warn(text: string) {
    LoggerService.local.warn(text)
  }

  public static log(text: string) {
    LoggerService.local.info(text)
  }

  public static logObject(object: any, depth: number = 2) {
    LoggerService.local.info(inspect(object, { depth }))
  }
}
