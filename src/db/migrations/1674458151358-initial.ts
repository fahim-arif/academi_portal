import {MigrationInterface, QueryRunner} from "typeorm";

export class initial1674458151358 implements MigrationInterface {
    name = 'initial1674458151358'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying, "google_id_token" character varying, "is_admin" boolean NOT NULL DEFAULT false, "token" character varying, "password" character varying, "forgot_password_code" character varying, "user_name" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_cedcc2dca8574b618eabdeced6e" UNIQUE ("google_id_token"), CONSTRAINT "UQ_d34106f8ec1ebaf66f4f8609dd6" UNIQUE ("user_name"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
