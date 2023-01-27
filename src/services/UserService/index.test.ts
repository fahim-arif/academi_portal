import { User } from '../../entities'
import { IContext } from '../../IContext'
import { TestUtils } from '../../test-utils/TestUtils'
import { UserService } from '.'
import * as faker from 'faker'
import { set, reset } from 'mockdate'
import { graphQlCall, Mutations } from '../../test-utils'
import { MINIMUM_PASSWORD_LENGTH, SPECIAL_CHAR } from '../../constants'

beforeAll(async () => {
  await TestUtils.setup('UserService')
})

afterAll(async () => {
  await TestUtils.tearDown()
})

beforeEach(async () => {
  await TestUtils.clearTable('"user"')
})

describe('UserService', () => {
  describe('getUserFromContext()', () => {
    it('getUserFromContext() with valid user', async () => {
      const user = await TestUtils.createUser()
      const context: IContext = {
        id: user.id,
        email: user.email,
      }

      const userFromContext = await UserService.getUserFromContext(context)
      expect(userFromContext!.id).toBe(user.id)
      expect(userFromContext!.email).toBe(user.email)
    })
  })
})
