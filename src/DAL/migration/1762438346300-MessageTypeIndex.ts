/* istanbul ignore file */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class MessageTypeIndex1762438346300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_message_type" ON "message" ("messageType");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_message_type";`);
  }
}
