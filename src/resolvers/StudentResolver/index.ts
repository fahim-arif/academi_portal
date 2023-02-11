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

@Resolver()
export class StudentResolver {
  public async generateToken(id: number, email: string): Promise<string> {
    const token = await jwt.sign({ id, email }, process.env.SECRET!, {
      expiresIn: '10y',
    })

    return token
  }

  @Query(() => Student)
  public async currentStudent(@Ctx() context: IContext): Promise<Student> {
    const user = await UserService.getStudentFromContext(context)
    ResolverUtils.checkUser(user)

    return user!
  }
  @Mutation(() => Student)
  public async studentLogin(
    @Ctx() context: IContext,
    @Arg(`email`, { nullable: true }) email: string,
    @Arg(`password`, { nullable: true }) password: string
  ): Promise<Student> {
    console.log('asdf')
    let user: Student | undefined

    if (email) {
      const isEmail = email.includes('@') && email.includes('.')

      if (isEmail) email = UserService.sanitizeEmail(email)

      user = await Student.findOne({
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

  @Mutation(() => Student)
  public async studentRegister(
    @Ctx() context: IContext,
    @Arg(`email`, { nullable: true }) email: string,
    @Arg(`password`, { nullable: true }) password: string,
    @Arg(`name`, { nullable: true }) name: string,
    @PubSub() pubSubEngine?: PubSubEngine
  ): Promise<Student> {
    let user

    if (email && password) {
      email = UserService.sanitizeEmail(email)

      // First check if user already exists
      user = await Student.findOne({ where: [{ email }, { name: ILike(name) }] })

      // Password must contain at least one lowercase, one uppercase, one number, one special character (e.g. !@#$%^&*)
      if (password.length < MINIMUM_PASSWORD_LENGTH || !password.match(REGEX_PATTERN)) {
        throw new Error(Errors.WEAK_PASSWORD)
      }
    }

    if (user) throw new Error(Errors.ALREADY_EXISTS)

    user = new Student()

    user.password = await StringUtils.hashPassword(password!)
    await user.save()

    return this.studentLogin(context, user.email, password!)
  }
}
