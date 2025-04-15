import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDatabase1744707813839 implements MigrationInterface {
  name = 'InitDatabase1744707813839';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "subscribers" ("service" character varying NOT NULL, "username" character varying NOT NULL, "chat_id" character varying NOT NULL, CONSTRAINT "PK_2cb6696568d0a8396f4b827882c" PRIMARY KEY ("service", "username"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "subscribers"`);
  }
}
