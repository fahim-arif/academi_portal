import { Resolver, Mutation, Ctx, Arg, Int, PubSub, PubSubEngine, Query } from 'type-graphql'
import { ILike } from 'typeorm'
import { Student, Teacher } from '../../entities'
import { IContext } from '../../IContext'
import { UserService } from '../../services'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Errors, MINIMUM_PASSWORD_LENGTH } from '../../constants'
import { REGEX_PATTERN } from '../../constants'
import { StringUtils } from '../../utils/StringUtils'
import { ResolverUtils } from '../ResolverUtils'

@Resolver(Teacher)
export class TeacherResolver {
  public async generateToken(id: number, email: string): Promise<string> {
    const token = await jwt.sign({ id, email }, process.env.SECRET!, {
      expiresIn: '10y',
    })

    return token
  }

  @Query(() => Teacher)
  public async currentTeacher(@Ctx() context: IContext): Promise<Teacher> {
    const user = await UserService.getUserFromContext(context)
    ResolverUtils.checkUser(user)

    return user!
  }
  @Mutation(() => Teacher)
  public async teacherLogin(
    @Ctx() context: IContext,
    @Arg(`email`, { nullable: true }) email: string,
    @Arg(`password`, { nullable: true }) password: string
  ): Promise<Teacher> {
    console.log('asdf')
    let user: Teacher | undefined

    if (email) {
      const isEmail = email.includes('@') && email.includes('.')

      if (isEmail) email = UserService.sanitizeEmail(email)

      user = await Teacher.findOne({
        where: [{ email: email }],
      })

      if (!user) throw new Error(Errors.INVALID_CREDS)

      const isPasswordCorrect = await bcrypt.compare(password, user!.password)
      if (!isPasswordCorrect) throw new Error(Errors.INVALID_CREDS)
    } else {
      throw new Error(Errors.UNAUTHORIZED)
    }

    user!.token = await this.generateToken(user!.id, user!.email!)

    await user!.save()
    return user!
  }

  @Mutation(() => Teacher)
  public async registerTeacher(
    @Ctx() context: IContext,
    @Arg(`email`, { nullable: true }) email: string,
    @Arg(`password`, { nullable: true }) password: string,
    @Arg(`name`, { nullable: true }) name: string,
    @PubSub() pubSubEngine?: PubSubEngine
  ): Promise<Teacher> {
    console.log('trig')

    let user

    if (email && password) {
      email = UserService.sanitizeEmail(email)
      console.log('trig2')

 
    }

    if (user) throw new Error(Errors.ALREADY_EXISTS)
    console.log('trig4')

    user = new Teacher()
    user.phone = 12345
    user.department = 'cse'
    console.log('trig55555')
    user.password = await StringUtils.hashPassword(password!)
    console.log(user.password)
    console.log('trig6')
    await user.save()
    console.log('last')

    return this.teacherLogin(context, user.email, password!)
  }
}
