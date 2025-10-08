import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  public id!: string;

  @Column()
  public sessionId!: number;

  @Column()
  public severity!: string;

  @Column()
  public timeStamp!: Date;

  @Column()
  public message!: string;

  @Column('jsonb', { default: {} })
  public messageParameters!: Record<string, undefined>;

  @Column()
  public component!: string;

  @Column()
  public messageType!: string;
}
