import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateUserEntity1676058065174 implements MigrationInterface {
    name = 'UpdateUserEntity1676058065174'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_cedcc2dca8574b618eabdeced6e"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "google_id_token"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "forgot_password_code"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_d34106f8ec1ebaf66f4f8609dd6"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "user_name"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "phone" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "student_id" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_726563a72061070f771b221345b" UNIQUE ("student_id")`);
        await queryRunner.query(`ALTER TABLE "user" ADD "department" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "section" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "designation" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "type" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "email" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "designation"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "section"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "department"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_726563a72061070f771b221345b"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "student_id"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "user_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_d34106f8ec1ebaf66f4f8609dd6" UNIQUE ("user_name")`);
        await queryRunner.query(`ALTER TABLE "user" ADD "forgot_password_code" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "google_id_token" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_cedcc2dca8574b618eabdeced6e" UNIQUE ("google_id_token")`);
    }

}
