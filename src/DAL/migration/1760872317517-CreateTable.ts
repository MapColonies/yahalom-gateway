/* istanbul ignore file */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTable1760872317517 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "message" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "sessionId" text NOT NULL,
        "message" text NOT NULL,
        "severity" "public"."message_severity_enum" NOT NULL,
        "component" "public"."message_component_enum" NOT NULL,
        "timeStamp" timestamp NOT NULL DEFAULT now(),
        "messageParameters" jsonb,
        "messageType" "public"."message_type_enum"
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "message";
    `);
  }
}
