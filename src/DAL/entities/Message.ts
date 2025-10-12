/* istanbul ignore file */
import 'reflect-metadata';
import { Entity, PrimaryColumn, Column, Timestamp } from 'typeorm';
import { SeverityLevels, LogComponent, AnalyticsMessageTypes } from './../../common/interfaces';

@Entity()
export class Message {
  @PrimaryColumn('text') //TODO: Should be of type PrimaryGeneratedColumn in the near future and int
  public id!: string;

  @Column('int')
  public sessionId!: number;

  @Column({ type: 'enum', enum: SeverityLevels })
  public severity!: SeverityLevels;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  public timeStamp!: Timestamp;

  @Column('varchar')
  public message!: string;

  @Column('jsonb', { nullable: true })
  public messageParameters!: Record<string, unknown> | undefined;

  @Column({ type: 'enum', enum: LogComponent })
  public component!: LogComponent;

  @Column({ type: 'enum', enum: AnalyticsMessageTypes })
  public messageType!: AnalyticsMessageTypes;
}
