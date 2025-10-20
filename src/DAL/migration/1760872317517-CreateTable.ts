/* istanbul ignore file */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTable1760872317517 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    // Drop table if exists (to avoid conflicts)
    await queryRunner.query(`
      DROP TABLE IF EXISTS "message" CASCADE;
    `);

    // Drop old enums if exist
    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."message_severity_enum" CASCADE;
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."message_component_enum" CASCADE;
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."message_type_enum" CASCADE;
    `);

    // Create enums
    await queryRunner.query(`
      CREATE TYPE "public"."message_severity_enum" AS ENUM(
        'EMERGENCY', 'ALERT', 'CRITICAL', 'ERROR', 'WARNING', 'NOTICE', 'INFORMATIONAL', 'DEBUG'
      );
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."message_component_enum" AS ENUM(
        'GENERAL', 'MAP', 'FTUE', 'SIMULATOR'
      );
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."message_type_enum" AS ENUM(
        'ANALYTICS', 'SYSTEM', 'USER', 'APPSTARTED', 'APPEXITED'
      );
    `);

    // Create message table
    await queryRunner.query(`
      CREATE TABLE "message" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "sessionId" bigint NOT NULL,
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
    await queryRunner.query(`DROP TABLE IF EXISTS "message";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."message_severity_enum" CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."message_component_enum" CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."message_type_enum" CASCADE;`);
  }
}
