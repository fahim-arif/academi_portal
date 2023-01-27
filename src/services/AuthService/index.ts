import { OAuth2Client, TokenPayload } from 'google-auth-library'
import { UserService } from '..'
import { Errors } from '../../constants'
import { User } from '../../entities'
import { IContext } from '../../IContext'
import { ResolverUtils } from '../../resolvers'

export class AuthService {
  private client: OAuth2Client

  public constructor() {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  }

  public static checkAdmin = (user: User | undefined) => {
    ResolverUtils.checkUser(user)

    if (!user!.isAdmin) {
      throw new Error(Errors.UNAUTHORIZED)
    }
  }

  public async verify(token: string): Promise<TokenPayload | undefined> {
    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    })

    const payload = ticket.getPayload()

    return payload
  }

  public static async checkContextAdmin(context: IContext) {
    const user = await UserService.getUserFromContext(context)
    AuthService.checkAdmin(user)
  }
}
