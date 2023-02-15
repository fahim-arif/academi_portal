import {MigrationInterface, QueryRunner} from "typeorm";

export class initial1676119607058 implements MigrationInterface {
    name = 'initial1676119607058'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "student" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "token" character varying, "password" character varying, "name" character varying NOT NULL, "phone" integer NOT NULL, "student_id" character varying NOT NULL, "department" character varying NOT NULL, "section" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_a56c051c91dbe1068ad683f536e" UNIQUE ("email"), CONSTRAINT "UQ_be3689991c2cc4b6f4cf39087fa" UNIQUE ("student_id"), CONSTRAINT "PK_3d8016e1cb58429474a3c041904" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "teacher" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "is_admin" boolean NOT NULL DEFAULT false, "token" character varying, "password" character varying, "name" character varying NOT NULL, "phone" integer NOT NULL, "department" character varying NOT NULL, "designation" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_00634394dce7677d531749ed8e8" UNIQUE ("email"), CONSTRAINT "PK_2f807294148612a9751dacf1026" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "teacher"`);
        await queryRunner.query(`DROP TABLE "student"`);
    }

}
