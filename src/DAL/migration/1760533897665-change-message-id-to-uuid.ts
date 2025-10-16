/* istanbul ignore file */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeMessageIdToUuid1760533897665 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "PK_ba01f0a3e0123651915008bc578"`);
    await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "message" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id")`);
    await queryRunner.query(`ALTER TYPE "public"."message_severity_enum" RENAME TO "message_severity_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."message_severity_enum" AS ENUM('EMERGENCY', 'ALERT', 'CRITICAL', 'ERROR', 'WARNING', 'NOTICE', 'INFORMATIONAL', 'DEBUG')`
    );
    await queryRunner.query(
      `ALTER TABLE "message" ALTER COLUMN "severity" TYPE "public"."message_severity_enum" USING "severity"::"text"::"public"."message_severity_enum"`
    );
    await queryRunner.query(`DROP TYPE "public"."message_severity_enum_old"`);
    await queryRunner.query(`ALTER TYPE "public"."message_component_enum" RENAME TO "message_component_enum_old"`);
    await queryRunner.query(`CREATE TYPE "public"."message_component_enum" AS ENUM('GENERAL', 'MAP', 'FTUE', 'SIMULATOR')`);
    await queryRunner.query(
      `ALTER TABLE "message" ALTER COLUMN "component" TYPE "public"."message_component_enum" USING "component"::"text"::"public"."message_component_enum"`
    );
    await queryRunner.query(`DROP TYPE "public"."message_component_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."message_component_enum_old" AS ENUM('GENERAL', 'MAP', 'FTUE', 'SIMULATOR')`);
    await queryRunner.query(
      `ALTER TABLE "message" ALTER COLUMN "component" TYPE "public"."message_component_enum_old" USING "component"::"text"::"public"."message_component_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."message_component_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."message_component_enum_old" RENAME TO "message_component_enum"`);
    await queryRunner.query(
      `CREATE TYPE "public"."message_severity_enum_old" AS ENUM('EMERGENCY', 'ALERT', 'CRITICAL', 'ERROR', 'WARNING', 'NOTICE', 'INFORMATIONAL', 'DEBUG')`
    );
    await queryRunner.query(
      `ALTER TABLE "message" ALTER COLUMN "severity" TYPE "public"."message_severity_enum_old" USING "severity"::"text"::"public"."message_severity_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."message_severity_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."message_severity_enum_old" RENAME TO "message_severity_enum"`);
    await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "PK_ba01f0a3e0123651915008bc578"`);
    await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "message" ADD "id" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id")`);
  }
}
