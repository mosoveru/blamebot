import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDatabase1744700381888 implements MigrationInterface {
  name = 'InitDatabase1744700381888';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "chat_entity" ("service" character varying NOT NULL, "username" character varying NOT NULL, "chat_id" character varying NOT NULL, CONSTRAINT "PK_67e14247c1db3c4c6a362826478" PRIMARY KEY ("service", "username"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "chat_entity"`);
  }
}
