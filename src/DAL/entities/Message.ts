import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Timestamp } from 'typeorm/browser';
import { SeverityLevels, LogComponent, AnalyticsMessageTypes } from './../../common/interfaces';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  public id!: string;

  @Column()
  public sessionId!: number;

  @Column({ type: 'enum', enum: SeverityLevels })
  public severity!: SeverityLevels;

  @Column()
  public timeStamp!: Timestamp;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  public message!: string;

  @Column('jsonb', { default: {} })
  public messageParameters!: Record<string, undefined>;

  @Column({ type: 'enum', enum: LogComponent })
  public component!: LogComponent;

  @Column({ type: 'enum', enum: AnalyticsMessageTypes })
  public messageType!: AnalyticsMessageTypes;
}
