import 'reflect-metadata'
import 'dotenv'

import cors from 'cors'
import throng from 'throng'
import jwt from 'jsonwebtoken'
import { createServer } from 'http'
import express, { json, raw } from 'express'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
// import { startStandaloneServer } from '@apollo/server/standalone'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'

import { Database } from './db'
import { IContext } from './IContext'
import { createSchema } from './resolvers'

// import { StorageService } from './services/StorageService'
import { LoggerService } from './services/LoggerService'

async function main() {
  try {
    // Starts Postgres
    LoggerService.initialize()
    LoggerService.info(`Starting Academi ...`)
    LoggerService.info(`Env: ${process.env.NODE_ENV}`)

    const db = new Database()
    await db.getConnection()

    // Starts server
    await startServer()

    LoggerService.info(`Server PID:${process.pid} has started on port ${process.env.PORT}!`)
  } catch (error) {
    console.error(`Error: ${error}`)
  }
}

const workers = process.env.WEB_CONCURRENCY || 2

throng({ worker: main, count: Number(workers), lifetime: Infinity })

const startServer = async () => {
  const expressApp = express()
  expressApp.use(cors({ origin: '*', credentials: true }))
  expressApp.use(json({ limit: '3mb' }))
  expressApp.use(
    raw({
      verify: (req, res, buf) => {
        if (buf && buf.length) {
          ;(req as any).rawBody = buf.toString()
        }
      },
      type: '*/*',
    })
  )

  const httpServer = createServer(expressApp)

  const schema = await createSchema()

  // Initialize error tracting before Apollo Server setup

  const apolloServer = new ApolloServer<Partial<IContext>>({
    schema,
    introspection: process.env.SHOULD_ALLOW_INTROSPECTION === 'true',
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  })

  await apolloServer.start()
  expressApp.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        const context = getContextFromAuthHeader(req?.get(`Authorization`), req?.get(`Fingerprint`))
        return context
      },
    })
  )

  httpServer.listen(process.env.PORT)
}

export function getContextFromAuthHeader(authHeader: string | undefined, fingerprintHeader: string | undefined) {
  let context: Partial<IContext> = {}

  if (authHeader) {
    const token = authHeader[1] ? authHeader.split(` `)[1] : ''

    if (token) {
      context = jwt.verify(token, process.env.SECRET!) as Partial<IContext>
    }
  }

  // the user and secret we are passing here is what we access in every resolver
  return context
}
