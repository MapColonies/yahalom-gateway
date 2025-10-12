/* istanbul ignore file */
import { Entity, PrimaryGeneratedColumn, Column, Timestamp } from 'typeorm';
import { SeverityLevels, LogComponent, AnalyticsMessageTypes } from './../../common/interfaces';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  public id!: string;

  @Column()
  public sessionId!: number;

  @Column({ type: 'enum', enum: SeverityLevels })
  public severity!: SeverityLevels;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  public timeStamp!: Timestamp;

  @Column()
  public message!: string;

  @Column('jsonb', { nullable: true })
  public messageParameters!: Record<string, unknown> | undefined;

  @Column({ type: 'enum', enum: LogComponent })
  public component!: LogComponent;

  @Column({ type: 'enum', enum: AnalyticsMessageTypes })
  public messageType!: AnalyticsMessageTypes;
}
