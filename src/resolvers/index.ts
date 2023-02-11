import { buildSchema } from 'type-graphql'
import { TeacherResolver } from './TeacherResolver'
import { StudentResolver } from './StudentResolver'
export { ResolverUtils } from './ResolverUtils'

export const createSchema = async () => {
  const schema = await buildSchema({
    resolvers: [TeacherResolver, StudentResolver],
    // validate: false,
  })

  return schema
}
