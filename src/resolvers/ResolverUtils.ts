import { Errors } from '../constants'
import { StudentDto, TeacherDto } from '../dtos'
import { Student, Teacher } from '../entities'
import { UserService } from '../services'

export class ResolverUtils {
  public static checkUser = (user: StudentDto | TeacherDto | Student | Teacher | undefined) => {
    UserService.checkUser(user)
  }

  public static getEnumKeys = (enumObject: any) => {
    const keys = Object.keys(enumObject).filter((k) => !isNaN(Number(k)))

    return keys
  }
}
