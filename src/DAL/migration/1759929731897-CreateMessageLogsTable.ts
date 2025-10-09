/* istanbul ignore file */
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMessageLogsTable1759929731897 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'log_object',
        columns: [
          {
            name: 'id',
            type: 'varchar', // TOOD: change type to serial/int when implemeting CRUD with pg
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
            type: 'varchar',
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
    await queryRunner.dropTable('log_object');
  }
}
