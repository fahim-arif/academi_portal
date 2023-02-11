import { graphQlCall } from '../../test-utils/graphQl'
import faker from 'faker'
import { MINIMUM_PASSWORD_LENGTH, Errors, SPECIAL_CHAR } from '../../constants'
import { TestUtils } from '../../test-utils/TestUtils'
import { Mutations } from '../../test-utils/mutations'
import { Teacher } from '../../entities'

beforeAll(async () => {
  await TestUtils.setup('UserResolver')
})

afterAll(async () => {
  await TestUtils.tearDown()
})

beforeEach(async () => {
  await TestUtils.clearTable('"user"')
})

describe('UserResolver', () => {
  describe('register()', () => {
    it('register() with valid user', async () => {
      const email = faker.internet.email()
      const userName = faker.internet.userName()

      const response = await graphQlCall({
        source: Mutations.REGISTER_TEACHER,
        variableValues: {
          userName,
          email,
          password: faker.internet.password(MINIMUM_PASSWORD_LENGTH, false, /\w/, SPECIAL_CHAR),
        },
      })

      const userReturned = response.data!.register

      expect(userReturned.id).toBeTruthy()
      expect(userReturned.name).toBe(userName)
      expect(userReturned.email).toBe(email.toLowerCase())
      expect(userReturned.token).toBeTruthy()

      // Check db too
      const dbUser = await Teacher.findOneOrFail({ where: { email: email.toLowerCase() } })
      expect(dbUser).toBeDefined()
      expect(dbUser.id).toBeGreaterThan(0)
      expect(dbUser.email).toBe(email.toLowerCase())
      expect(dbUser.token).toBeDefined()
    })

    it('register() reject duplicate username with different case', async () => {
      await TestUtils.createStudent({ userName: 'first' })

      const response = await graphQlCall({
        source: Mutations.REGISTER_TEACHER,
        variableValues: {
          userName: 'First',
          email: faker.internet.email(),
          password: faker.internet.password(MINIMUM_PASSWORD_LENGTH, false, /\w/, SPECIAL_CHAR),
        },
      })

      const registerError = response.errors

      expect(registerError![0].message).toBe('ALREADY_EXISTS')
    })

    it('register() reject duplicate email with +', async () => {
      const email = 'first@test.com'
      await TestUtils.createStudent({ email })
      const response = await graphQlCall({
        source: Mutations.REGISTER_TEACHER,
        variableValues: {
          userName: 'First',
          email: 'first+2@test.com',
          password: faker.internet.password(MINIMUM_PASSWORD_LENGTH, false, /\w/, SPECIAL_CHAR),
        },
      })

      const error = response.errors![0].message

      expect(error).toBe(Errors.ALREADY_EXISTS)
    })
  })

  describe('login()', () => {
    it('login with email', async () => {
      const password = faker.internet.password(MINIMUM_PASSWORD_LENGTH, false, /\w/, SPECIAL_CHAR)
      const user = await TestUtils.createStudent({ password })

      const response = await graphQlCall({
        source: Mutations.LOGIN_TEACHER,
        variableValues: {
          email: user.email,
          password,
        },
      })

      const loginUser = response.data!.login

      expect(parseInt(loginUser.id)).toBe(user.id)
    })

    it('login with username', async () => {
      const password = faker.internet.password(MINIMUM_PASSWORD_LENGTH, false, /\w/, SPECIAL_CHAR)
      const user = await TestUtils.createTeacher({ password })

      const response = await graphQlCall({
        source: Mutations.LOGIN_TEACHER,
        variableValues: {
          email: user.email,
          password: password,
        },
      })

      const loginUser = response.data!.login

      expect(parseInt(loginUser.id)).toBe(user.id)
    })

    it('login with case insentive username', async () => {
      const password = faker.internet.password(MINIMUM_PASSWORD_LENGTH, false, /\w/, SPECIAL_CHAR)
      const user = await TestUtils.createStudent({ password })
      const response = await graphQlCall({
        source: Mutations.LOGIN_TEACHER,
        variableValues: {
          email: user.email.toUpperCase(),
          password,
        },
      })

      const loginUser = response.data!.login

      expect(parseInt(loginUser.id)).toBe(user.id)
    })

    it('email or username not found', async () => {
      const response = await graphQlCall({
        source: Mutations.LOGIN_TEACHER,
        variableValues: {
          email: 'very@wrong.com',
          password: 'wjatever',
        },
      })

      const loginError = response.errors

      expect(loginError![0].message).toBe(Errors.INVALID_CREDS)
    })

    it('login in with wrong password', async () => {
      const user = await TestUtils.createStudent()

      const response = await graphQlCall({
        source: Mutations.LOGIN_TEACHER,
        variableValues: {
          email: user.email,
          password: 'wrongPass',
        },
      })

      const loginError = response.errors

      expect(loginError![0].message).toBe(Errors.INVALID_CREDS)
    })

    it('login in with a + in the email', async () => {
      const password = faker.internet.password()
      const user = await TestUtils.createStudent({ email: 'email@test.com' })

      const response = await graphQlCall({
        source: Mutations.LOGIN_TEACHER,
        variableValues: {
          email: 'email+test@test.com',
          password,
        },
      })

      const loginError = response.errors

      expect(loginError![0].message).toBe('INVALID_CREDS')
    })
  })
})
