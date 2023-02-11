import { IsDate, IsNumber, IsString, IsArray } from 'class-validator'
import { Field, ID, ObjectType } from 'type-graphql'
import { Student } from '../entities'

@ObjectType()
export class TeacherDto {
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
  public name: string

  constructor(user: Student) {
    this.id = user.id
    this.createdAt = user.createdAt
    // this.imageId = user.imageId
    this.name = user.name
  }
}
