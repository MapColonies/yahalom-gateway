/* istanbul ignore file */
import { Entity, PrimaryGeneratedColumn, Column, Timestamp, Index } from 'typeorm';
import { SeverityLevels, LogComponent, AnalyticsMessageTypes } from '../../common/interfaces';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column('text')
  public sessionId!: string;

  @Column({ type: 'enum', enum: SeverityLevels, enumName: 'message_severity_enum' })
  public severity!: SeverityLevels;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  public timeStamp!: Timestamp;

  @Column('varchar')
  public message!: string;

  @Column('jsonb', { nullable: true })
  public messageParameters?: Record<string, unknown>;

  @Column({ type: 'enum', enum: LogComponent, enumName: 'message_component_enum' })
  public component!: LogComponent;

  @Index('IDX_message_type')
  @Column({ type: 'enum', enum: AnalyticsMessageTypes, enumName: 'message_type_enum' })
  public messageType!: AnalyticsMessageTypes;
}
