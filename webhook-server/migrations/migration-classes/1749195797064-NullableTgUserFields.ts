import { MigrationInterface, QueryRunner } from "typeorm";

export class NullableTgUserFields1749195797064 implements MigrationInterface {
    name = 'NullableTgUserFields1749195797064'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "telegram_users" ALTER COLUMN "username" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "telegram_users" ALTER COLUMN "name" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "telegram_users" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "telegram_users" ALTER COLUMN "username" SET NOT NULL`);
    }

}
