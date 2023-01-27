import bcrypt from 'bcryptjs'
import * as util from 'util'
import { LoggerService } from '../services/LoggerService'

export class StringUtils {
  /**
   * Capitalizes first letter of each word in string
   * @param words
   * @returns
   */
  public static capitalize = (words: string) =>
    words
      .split(' ')
      .map((w) => w.substring(0, 1).toUpperCase() + w.substring(1))
      .join(' ')

  public static async hashPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 12)
    return hashedPassword
  }

  public static printObject(o: unknown, depth?: number) {
    LoggerService.log(util.inspect(o, false, depth, true))
  }
}
