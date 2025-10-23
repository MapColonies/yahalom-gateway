/* istanbul ignore file */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTable1760872317517 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_severity_enum') THEN
          CREATE TYPE "public"."message_severity_enum" AS ENUM('ERROR', 'WARNING', 'INFO', 'ALERT');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_component_enum') THEN
          CREATE TYPE "public"."message_component_enum" AS ENUM('MAP', 'GENERAL', 'UI', 'API');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type_enum') THEN
          CREATE TYPE "public"."message_type_enum" AS ENUM('APPEXITED', 'APPSTARTED', 'APPERROR');
        END IF;
      END
      $$;
    `);

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
    await queryRunner.query(`DROP TABLE IF EXISTS "message";`);

    await queryRunner.query(`DROP TYPE IF EXISTS "public"."message_severity_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."message_component_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."message_type_enum";`);
  }
}
