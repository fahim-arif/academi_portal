import { Resolver, Mutation, Ctx, Arg, Int, PubSub, PubSubEngine, Query } from 'type-graphql'
import { ILike } from 'typeorm'
import { User } from '../../entities'
import { IContext } from '../../IContext'
import { AuthService, UserService } from '../../services'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Errors, MINIMUM_PASSWORD_LENGTH } from '../../constants'
import { REGEX_PATTERN } from '../../constants'
import { StringUtils } from '../../utils/StringUtils'
import { ResolverUtils } from '../ResolverUtils'

@Resolver(User)
export class UserResolver {
  public async generateToken(id: number, email: string): Promise<string> {
    const token = await jwt.sign({ id, email }, process.env.SECRET!, {
      expiresIn: '10y',
    })

    return token
  }

  @Query(() => User)
  public async currentUser(@Ctx() context: IContext): Promise<User> {
    const user = await UserService.getUserFromContext(context, {
      relations: [
        'referralsMade',
        'referralLevel',
        'orientations',
        'subscriptions',
        'nftsOwned',
        'nftsMinted',
        'nftsOwned.listings',
        'nftsMinted.listings',
        'performer',
      ],
    })
    ResolverUtils.checkUser(user)

    return user!
  }
  @Mutation(() => User)
  public async login(
    @Ctx() context: IContext,
    @Arg(`emailOrUsername`, { nullable: true }) emailOrUsername: string,
    @Arg(`password`, { nullable: true }) password: string,
    @Arg(`googleIdToken`, { nullable: true }) googleIdToken?: string
  ): Promise<User> {
    console.log('asdf')
    let user: User | undefined

    if (emailOrUsername) {
      const isEmail = emailOrUsername.includes('@') && emailOrUsername.includes('.')

      if (isEmail) emailOrUsername = UserService.sanitizeEmail(emailOrUsername)

      user = await User.findOne({
        where: [{ email: emailOrUsername }, { userName: ILike(emailOrUsername) }],
      })

      if (!user) throw new Error(Errors.INVALID_CREDS)

      const isPasswordCorrect = await bcrypt.compare(password, user!.password)
      if (!isPasswordCorrect) throw new Error(Errors.INVALID_CREDS)
    } else if (googleIdToken) {
      // handle googleIdToken
      const authService = new AuthService()
      const tokenPayload = await authService.verify(googleIdToken)

      if (!tokenPayload) throw new Error(Errors.ERROR_AUTHENTICATING_WITH_GOOGLE)

      user = await User.findOne({ where: { email: tokenPayload.email } })

      if (!user) return this.register(context, googleIdToken)
    } else {
      throw new Error(Errors.UNAUTHORIZED)
    }

    user!.token = await this.generateToken(user!.id, user!.email!)

    await user!.save()
    return user!
  }

  @Mutation(() => User)
  public async register(
    @Ctx() context: IContext,
    @Arg(`googleIdToken`, { nullable: true }) googleIdToken?: string,
    @Arg(`email`, { nullable: true }) email?: string,
    @Arg(`password`, { nullable: true }) password?: string,
    @Arg(`userName`, { nullable: true }) userName?: string,
    @PubSub() pubSubEngine?: PubSubEngine
  ): Promise<User> {
    let user

    if (googleIdToken) user = await User.findOne({ where: { googleIdToken } })
    else if (email && password) {
      email = UserService.sanitizeEmail(email)

      // First check if user already exists
      user = await User.findOne({ where: [{ email }, { userName: ILike(userName) }] })

      // Password must contain at least one lowercase, one uppercase, one number, one special character (e.g. !@#$%^&*)
      if (password.length < MINIMUM_PASSWORD_LENGTH || !password.match(REGEX_PATTERN)) {
        throw new Error(Errors.WEAK_PASSWORD)
      }
    } else throw new Error(Errors.EMAIL_OR_GOOGLE_ID_NOT_PROVIDED)

    if (user) throw new Error(Errors.ALREADY_EXISTS)

    user = new User()

    if (googleIdToken) {
      user.googleIdToken = googleIdToken
      // handle googleIdToken
      const authService = new AuthService()
      const tokenPayload = await authService.verify(googleIdToken)

      if (!tokenPayload) throw new Error(Errors.ERROR_AUTHENTICATING_WITH_GOOGLE)

      // handle email
      const existingUserByEmail = await User.findOne({ where: { email: tokenPayload.email } })
      if (existingUserByEmail) throw new Error(Errors.EMAIL_ALREADY_EXISTS)

      user.email = tokenPayload?.email!

      // Assign random password
      password = await StringUtils.hashPassword(uuidv4())

      // handle username
      const googleUserName = user.email.substring(0, user.email.indexOf('@'))
      const existingUserByUsername = await User.findOne({ where: { userName: ILike(googleUserName) } })

      if (existingUserByUsername) {
        // Iterate to find available username
        let attempts = 1
        while (!user.userName) {
          const userNameProposal = `${googleUserName}${attempts}`
          const existingUser = await User.findOne({ where: { userName: ILike(userNameProposal) } })

          if (!existingUser) user.userName = userNameProposal
        }
      } else user.userName = googleUserName

      //todo handle picture
      // if (tokenPayload.picture)
      //   user.imageId = await ImageService.upload({ file: tokenPayload.picture!, folder: 'users' })
      // else {
      //   LoggerService.warn('No picture available')
      // }
    } else {
      user.email = email!
      user.userName = userName!
    }

    user.password = await StringUtils.hashPassword(password!)
    await user.save()

    return this.login(context, user.email, password!)
  }
}
