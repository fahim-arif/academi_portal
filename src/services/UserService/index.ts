import { FindOneOptions } from 'typeorm'
import { Errors } from '../../constants'
import { StudentDto, TeacherDto } from '../../dtos'
import { Student, Teacher } from '../../entities'
import { IContext } from '../../IContext'

type InitializeVideoUploadData = {
  title: string
  description?: string
  tagIds?: number[]
  performerIds?: number[]
}

export class UserService {
  public static checkUser(user: StudentDto | TeacherDto | Teacher | Student | undefined) {
    if (!user) {
      throw new Error(Errors.USER_NOT_FOUND)
    }
  }
  public static async getStudentFromContext(context: IContext, options?: FindOneOptions<Student>): Promise<Student | undefined> {
    let user: Student | undefined

    if (context?.id) {
      user = await Student.findOne(context.id, options!)
    }

    return user
  }

  public static async getUserFromContext(context: IContext, options?: FindOneOptions<Teacher>): Promise<Teacher | undefined> {
    let user: Teacher | undefined

    if (context?.id) {
      user = await Teacher.findOne(context.id, options!)
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
