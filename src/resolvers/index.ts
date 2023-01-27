import { buildSchema } from 'type-graphql'
import { UserResolver } from './UserResolver'
export { ResolverUtils } from './ResolverUtils'

export const createSchema = async () => {
  const schema = await buildSchema({
    resolvers: [UserResolver],
    // validate: false,
  })

  return schema
}
