import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMessageLogsTable1759919024652 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'log_object',
        columns: [
          {
            name: 'id',
            type: 'serial', // or 'int' if you prefer, but it's a string in your entity — likely a mistake?
            isPrimary: true,
          },
          {
            name: 'sessionId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'severity',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'timeStamp',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'message',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'messageParameters',
            type: 'jsonb',
            isNullable: false,
            default: `'{}'`,
          },
          {
            name: 'component',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'messageType',
            type: 'varchar',
            isNullable: false,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('messlog_objectage');
  }
}
