import * as dotenv from 'dotenv'
dotenv.config()
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import { Connection, ConnectionManager, createConnection, getConnectionManager } from 'typeorm'

import { inspect } from 'util'
import databaseConfig from './ormConfig'
import { LoggerService } from '../services/LoggerService'

/**
 * Database manager class, wrapper around TypeORM - test
 */
export class Database {
  private connectionManager: ConnectionManager

  public constructor(config = { silent: false }) {
    this.connectionManager = getConnectionManager()
    if (!config.silent) LoggerService.info(`Database()-connectionOptions: ${inspect(databaseConfig, { depth: 4 })}`)
  }

  /**
   * Gets the database connection given connectionOptions
   * @param connectionOptions
   */
  public async getConnection(connectionOptions: PostgresConnectionOptions = databaseConfig): Promise<Connection> {
    let connection: Connection

    if (this.connectionManager.has(connectionOptions.name!)) {
      connection = this.connectionManager.get(connectionOptions.name!)
    } else {
      try {
        connection = await createConnection(connectionOptions)
      } catch (error) {
        LoggerService.error(`Database.getConnection() failed: ${inspect(error)}`)
        throw error
      }
    }

    if (!connection.isConnected) {
      connection = await connection.connect()
    }

    return connection
  }
}
