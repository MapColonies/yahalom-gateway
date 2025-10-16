/* istanbul ignore file */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTable1760514363618 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."message_severity_enum" AS ENUM('EMERGENCY', 'ALERT', 'CRITICAL', 'ERROR', 'WARNING', 'NOTICE', 'INFORMATIONAL', 'DEBUG')`
    );
    await queryRunner.query(`CREATE TYPE "public"."message_component_enum" AS ENUM('GENERAL', 'MAP', 'FTUE', 'SIMULATOR')`);
    await queryRunner.query(
      `CREATE TYPE "public"."message_type_enum" AS ENUM('APPSTARTED', 'APPEXITED', 'USERDETAILS', 'USERMACHINESPEC', 'USERDEVICES', 'DEVICECONNECTED', 'DEVICEDISCONNECTED', 'GAMEMODESTARTED', 'GAMEMODEENDED', 'IDLETIMESTARTED', 'IDLETIMEENDED', 'LAYERUSESTARTED', 'LAYERUSERENDED', 'MULTIPLAYERSTARTED', 'MULTIPLAYERENDED', 'LOCATION', 'ERROR', 'GENERALINFO', 'WARNING', 'CONSUMPTIONSTATUS', 'APPLICATIONDATA')`
    );
    await queryRunner.query(
      `CREATE TABLE "message" ("id" text NOT NULL, "sessionId" integer NOT NULL, "severity" "public"."message_severity_enum" NOT NULL, "timeStamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "message" character varying NOT NULL, "messageParameters" jsonb, "component" "public"."message_component_enum" NOT NULL, "messageType" "public"."message_type_enum" NOT NULL, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "message"`);
    await queryRunner.query(`DROP TYPE "public"."message_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."message_component_enum"`);
    await queryRunner.query(`DROP TYPE "public"."message_severity_enum"`);
  }
}
