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
export class Teacher extends BaseEntity {
  @Field(() => ID!)
  @PrimaryGeneratedColumn()
  public id: number

  @Field(() => String)
  @Column({ unique: true })
  public email: string

  @Field(() => Boolean)
  @Column({ default: false })
  public isAdmin: boolean

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  public token: string

  @Column({ nullable: true })
  public password: string

  @Field(() => String)
  @Column()
  public name: string

  @Field(() => Int)
  @Column()
  public phone: number

  @Field(() => String)
  @Column()
  public department: string

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  public designation?: string

  @Field(() => Date!)
  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt: Date
}
