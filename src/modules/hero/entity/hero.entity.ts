import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export default class Hero {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nickname: string;

  @Column()
  realName: string;

  @Column()
  originDescription: string;

  @Column()
  superpowers: string;

  @Column()
  catchPhrase: string;

  @Column('simple-array', { nullable: true })
  images: string[];
}
