import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminColumnTgUser1749538435021 implements MigrationInterface {
  name = 'AdminColumnTgUser1749538435021';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "telegram_users" ADD "isAdmin" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "telegram_users" DROP COLUMN "isAdmin"`);
  }
}
