import { Errors } from '../constants'
import { UserDto } from '../dtos'
import { User } from '../entities'
import { UserService } from '../services'

export class ResolverUtils {
  public static checkUser = (user: User | UserDto | undefined) => {
    UserService.checkUser(user)
  }

  public static getEnumKeys = (enumObject: any) => {
    const keys = Object.keys(enumObject).filter((k) => !isNaN(Number(k)))

    return keys
  }
}
