/* istanbul ignore file */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTable1760872317517 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."message_severity_enum" AS ENUM('EMERGENCY', 'ALERT', 'CRITICAL', 'ERROR', 'WARNING', 'NOTICE', 'INFORMATIONAL', 'DEBUG')`
    );

    await queryRunner.query(`CREATE TYPE "public"."message_component_enum" AS ENUM('GENERAL', 'MAP', 'FTUE', 'SIMULATOR')`);

    await queryRunner.query(`
      CREATE TABLE "message" (
        "id" SERIAL PRIMARY KEY,
        "sessionId" bigint NOT NULL,
        "message" text NOT NULL,
        "severity" "public"."message_severity_enum" NOT NULL,
        "component" "public"."message_component_enum" NOT NULL,
        "timeStamp" timestamp NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "message"`);

    await queryRunner.query(`DROP TYPE "public"."message_severity_enum"`);
    await queryRunner.query(`DROP TYPE "public"."message_component_enum"`);
  }
}
