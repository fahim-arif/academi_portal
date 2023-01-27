import * as dotenv from 'dotenv'
dotenv.config()
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import { entities } from './entities'
import { SnakeNamingStrategy } from './SnakeNamingStrategy'

const config: PostgresConnectionOptions = {
  name: `default`,
  type: `postgres`,
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
  entities,
  migrations: [`./build/db/migrations/*.js`], // Migrations can only be run on .js files
  cli: {
    migrationsDir: `./src/db/migrations`,
  },
  replication: {
    master: {
      url: `${process.env.DATABASE_URL}`,
      ssl:
        process.env.NODE_ENV === 'dev'
          ? undefined
          : {
              rejectUnauthorized: false,
            },
    },
    slaves: [
      {
        // Follower DB has different env var names in prod vs stage
        url: `${
          process.env.HEROKU_POSTGRESQL_BLUE_URL ||
          process.env.HEROKU_POSTGRESQL_COBALT_URL ||
          process.env.HEROKU_POSTGRESQL_AQUA_URL
        }`,
        ssl:
          process.env.NODE_ENV === 'dev'
            ? undefined
            : {
                rejectUnauthorized: false,
              },
      },
    ],
  },
}

export = config
