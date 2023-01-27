import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity,
  OneToMany,
  OneToOne,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm'
import { ObjectType, Field, ID, Int } from 'type-graphql'
import { Type } from '../types/User'

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @Field(() => ID!)
  @PrimaryGeneratedColumn()
  public id: number

  @Field(() => String, { nullable: true })
  @Column({ unique: true, nullable: true })
  public email?: string

  @Field(() => String, { nullable: true })
  @Column({ unique: true, nullable: true })
  public googleIdToken: string

  @Field(() => Boolean)
  @Column({ default: false })
  public isAdmin: boolean

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  public token: string

  @Column({ nullable: true })
  public password: string

  @Column({ nullable: true })
  public forgotPasswordCode: string

  @Field(() => String)
  @Column({ unique: true })
  public userName: string

  @Field(() => Date!)
  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt: Date

  @Field(() => Type)
  @Column({ default: Type.STUDENT })
  public type: Type
}
