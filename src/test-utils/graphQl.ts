import { graphql, GraphQLSchema } from 'graphql'
import { Maybe } from 'type-graphql'
import { createSchema } from '../resolvers'

export interface IOptions {
  source: string
  variableValues?: Maybe<{
    [key: string]: any
  }>
  userId?: number
}

let schema: GraphQLSchema

export const graphQlCall = async ({ source, variableValues, userId }: IOptions) => {
  if (!schema) {
    schema = await createSchema()
  }

  return graphql({
    schema,
    source,
    variableValues,
    contextValue: {
      id: userId,
    },
  })
}
