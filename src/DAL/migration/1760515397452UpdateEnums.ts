/* istanbul ignore file */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEnums1760515397452 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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

    await queryRunner.query(`ALTER TYPE "public"."message_type_enum" RENAME TO "message_type_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."message_type_enum" AS ENUM('APPSTARTED', 'APPEXITED', 'USERDETAILS', 'USERMACHINESPEC', 'USERDEVICES', 'DEVICECONNECTED', 'DEVICEDISCONNECTED', 'GAMEMODESTARTED', 'GAMEMODEENDED', 'IDLETIMESTARTED', 'IDLETIMEENDED', 'LAYERUSESTARTED', 'LAYERUSERENDED', 'MULTIPLAYERSTARTED', 'MULTIPLAYERENDED', 'LOCATION', 'ERROR', 'GENERALINFO', 'WARNING', 'CONSUMPTIONSTATUS', 'APPLICATIONDATA')`
    );
    await queryRunner.query(
      `ALTER TABLE "message" ALTER COLUMN "messageType" TYPE "public"."message_type_enum" USING "messageType"::"text"::"public"."message_type_enum"`
    );
    await queryRunner.query(`DROP TYPE "public"."message_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."message_type_enum_old" AS ENUM('APPSTARTED', 'APPEXITED', 'USERDETAILS', 'USERMACHINESPEC', 'USERDEVICES', 'DEVICECONNECTED', 'DEVICEDISCONNECTED', 'GAMEMODESTARTED', 'GAMEMODEENDED', 'IDLETIMESTARTED', 'IDLETIMEENDED', 'LAYERUSESTARTED', 'LAYERUSERENDED', 'MULTIPLAYERSTARTED', 'MULTIPLAYERENDED', 'LOCATION', 'ERROR', 'GENERALINFO', 'WARNING', 'CONSUMPTIONSTATUS', 'APPLICATIONDATA')`
    );
    await queryRunner.query(
      `ALTER TABLE "message" ALTER COLUMN "messageType" TYPE "public"."message_type_enum_old" USING "messageType"::text::"public"."message_type_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."message_type_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."message_type_enum_old" RENAME TO "message_type_enum"`);

    await queryRunner.query(`CREATE TYPE "public"."message_component_enum_old" AS ENUM('GENERAL', 'MAP', 'FTUE', 'SIMULATOR')`);
    await queryRunner.query(
      `ALTER TABLE "message" ALTER COLUMN "component" TYPE "public"."message_component_enum_old" USING "component"::text::"public"."message_component_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."message_component_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."message_component_enum_old" RENAME TO "message_component_enum"`);

    await queryRunner.query(
      `CREATE TYPE "public"."message_severity_enum_old" AS ENUM('EMERGENCY', 'ALERT', 'CRITICAL', 'ERROR', 'WARNING', 'NOTICE', 'INFORMATIONAL', 'DEBUG')`
    );
    await queryRunner.query(
      `ALTER TABLE "message" ALTER COLUMN "severity" TYPE "public"."message_severity_enum_old" USING "severity"::text::"public"."message_severity_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."message_severity_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."message_severity_enum_old" RENAME TO "message_severity_enum"`);
  }
}
