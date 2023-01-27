import { IsDate, IsNumber, IsString, IsArray } from 'class-validator'
import { Field, ID, ObjectType } from 'type-graphql'
import { User } from '../entities'

@ObjectType()
export class UserDto {
  @IsNumber()
  @Field(() => ID)
  public id: number

  @IsDate()
  @Field()
  public createdAt: Date

  @IsString()
  @Field(() => String, { description: 'Avatar image id' })
  public imageId: string

  @IsString()
  @Field(() => String, { description: 'Wallet address', nullable: true })
  public walletAddress?: string

  @IsString()
  @Field(() => String)
  public userName: string

  constructor(user: User) {
    this.id = user.id
    this.createdAt = user.createdAt
    // this.imageId = user.imageId
    this.userName = user.userName
  }
}
