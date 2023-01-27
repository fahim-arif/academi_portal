import { FindOneOptions } from 'typeorm'
import { Errors } from '../../constants'
import { UserDto } from '../../dtos'
import { User } from '../../entities'
import { IContext } from '../../IContext'

type InitializeVideoUploadData = {
  title: string
  description?: string
  tagIds?: number[]
  performerIds?: number[]
}

export class UserService {
  public static checkUser(user: User | UserDto | undefined) {
    if (!user) {
      throw new Error(Errors.USER_NOT_FOUND)
    }
  }
  public static async getUserFromContext(context: IContext, options?: FindOneOptions<User>): Promise<User | undefined> {
    let user: User | undefined

    if (context?.id) {
      user = await User.findOne(context.id, options!)
    }

    return user
  }

  public static sanitizeEmail(email: string): string {
    email = email.toLowerCase()
    const duplicateIndex = email.indexOf('+')
    if (duplicateIndex) {
      const duplicateIndexEnd = email.indexOf('@')
      const duplicateText = email.slice(duplicateIndex, duplicateIndexEnd)
      email = email.replace(duplicateText, '')
    }
    return email
  }
}
