import { Connection, createConnection, getConnection } from 'typeorm'
import { SnakeNamingStrategy } from '../db'
import { entities } from '../db/ormConfig'
import { Student, Teacher } from '../entities'
import faker from 'faker'
import { MINIMUM_PASSWORD_LENGTH, SPECIAL_CHAR } from '../constants'
import { ExecutionResult } from 'graphql'
import { Polly } from '@pollyjs/core'
import HttpAdapter from '@pollyjs/adapter-node-http'
import Persistor from '@pollyjs/persister-fs'
import { ICreateUserOptions } from './interfaces'
import moment from 'moment'
import axios from 'axios'
import { BigNumber, BigNumberish } from 'ethers'
import { Offer } from '@thirdweb-dev/sdk'
import slugify from 'slugify'
import { LoggerService } from '../services/LoggerService'
import { StringUtils } from '../utils/StringUtils'
const querystring = require('querystring')

export class TestUtils {
  private static postgresConnection: Connection
  public static polly: Polly

  public static async createAdmin(): Promise<Student> {
    const admin = await TestUtils.createStudent({ isAdmin: true })
    return admin
  }

  public static logResponse(response: ExecutionResult) {
    if (response.errors) {
      LoggerService.log(JSON.stringify({ error: response!.errors[0] }))
    } else {
      LoggerService.log(JSON.stringify(response.data, null, 2))
    }
  }

  public static async createStudent(options?: ICreateUserOptions): Promise<Student> {
    const user = new Student()
    if (!options?.noEmail) {
      user.email = options?.email || faker.internet.email().toLowerCase()
    }
    user.email = faker.internet.email()
    user.password = await StringUtils.hashPassword(
      options?.password || faker.internet.password(MINIMUM_PASSWORD_LENGTH, false, /\w/, SPECIAL_CHAR)
    )
    user.token = faker.random.alphaNumeric(20)
    user.email = options?.email || faker.internet.email()

    await user.save()

    return user
  }

  public static async createTeacher(options?: ICreateUserOptions): Promise<Student> {
    const user = new Student()
    if (!options?.noEmail) {
      user.email = options?.email || faker.internet.email().toLowerCase()
    }
    user.email = faker.internet.email()
    user.password = await StringUtils.hashPassword(
      options?.password || faker.internet.password(MINIMUM_PASSWORD_LENGTH, false, /\w/, SPECIAL_CHAR)
    )
    user.token = faker.random.alphaNumeric(20)
    user.email = options?.email || faker.internet.email()

    await user.save()

    return user
  }

  public static setup = async (name: string, shouldUsePolly: boolean = true) => {
    process.env.NODE_ENV = 'test'

    TestUtils.postgresConnection = await createConnection({
      name: `default`,
      type: `postgres`,
      synchronize: true,
      url: process.env.DATABASE_URL_TEST,
      namingStrategy: new SnakeNamingStrategy(),
      entities: entities,
      logging: false,
      migrations: [`./build/db/migrations/*.js`], // Migrations can only be run on .js files
      cli: {
        migrationsDir: `./src/db/migrations`,
      },
      dropSchema: true,
    })

    if (!TestUtils.postgresConnection.isConnected) {
      await TestUtils.postgresConnection.connect()
    }

    // Starts redis service
    // StorageService.start()

    // Set up Polly for network mocking
    Polly.register(HttpAdapter)
    Polly.register(Persistor)

    if (shouldUsePolly) {
      TestUtils.polly = new Polly(name, {
        adapters: ['node-http'],
        persister: 'fs',
        logLevel: 'silent',
        matchRequestsBy: {
          headers: false,
          body: false,
          url: {
            pathname: false,
            query: false,
            hash: false,
          },
        },
      })
    }
  }

  public static async getGoogleIdToken(refreshToken = process.env.GOOGLE_REFRESH_TOKEN): Promise<string> {
    const body = {
      grant_type: 'refresh_token',
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
    }

    const response = await axios.post('https://www.googleapis.com/oauth2/v4/token', querystring.stringify(body), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    return response.data.id_token
  }

  /**
   * Drops database and closes connection
   * @param connection
   */
  public static async tearDown(shouldDrop: boolean = false) {
    const connection = getConnection()

    // Postgres
    if (connection && connection.isConnected) {
      if (shouldDrop) {
        await connection.dropDatabase()
      }
      await connection.close()
    }

    // Redis
    // await StorageService.clear('test')
    // await StorageService.disconnect()

    if (TestUtils.polly) {
      await TestUtils.polly.stop()
    }
  }

  public static async clearTable(tableName: string) {
    return await getConnection().manager.query(`TRUNCATE TABLE ${tableName} CASCADE;`)
  }

  // public static mocks() {
  //   return MockUtils
  // }

  public static ThirdwebJsonReviver = (key: string, value: any) => {
    const keys = [
      'id',
      'quantity',
      'tokenId',
      'startTimeInSeconds',
      'secondsUntilEnd',
      'buyoutPrice',
      'startTimeInEpochSeconds',
      'reservePrice',
      'endTimeInEpochSeconds',
      'value',
    ]
    if (keys.includes(key) && typeof value === 'object' && value.type === 'BigNumber') {
      return BigNumber.from(value.hex)
    }
    return value
  }

  public static inflateThirdwebJSONstr = (jsonStr: string) => {
    return JSON.parse(jsonStr, TestUtils.ThirdwebJsonReviver)
  }
}

export class TestOffer implements Offer {
  listingId: BigNumberish
  buyerAddress: string
  quantityDesired: BigNumberish
  pricePerToken: BigNumber
  currencyValue: { symbol: string; value: BigNumber; name: string; decimals: number; displayValue: string }
  currencyContractAddress: string
}
