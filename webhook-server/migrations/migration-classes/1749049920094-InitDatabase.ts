import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDatabase1749049920094 implements MigrationInterface {
  name = 'InitDatabase1749049920094';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."GitProviders" AS ENUM('GITLAB', 'GITEA')`);
    await queryRunner.query(
      `CREATE TABLE "instances" ("instanceId" character varying NOT NULL, "instanceName" character varying NOT NULL, "gitProvider" "public"."GitProviders" NOT NULL, "serviceBaseUrl" character varying NOT NULL, CONSTRAINT "UQ_c2b3096d7dc1448062a871a0dc4" UNIQUE ("serviceBaseUrl"), CONSTRAINT "PK_4371bdb22fb067ac72906098496" PRIMARY KEY ("instanceId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "instance_users" ("instanceUserId" character varying NOT NULL, "instanceId" character varying NOT NULL, "telegramUserId" character varying NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "pathname" character varying NOT NULL, CONSTRAINT "PK_a6eeb4a7322fe5fc743792d906e" PRIMARY KEY ("instanceUserId", "instanceId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "telegram_users" ("telegramUserId" character varying NOT NULL, "username" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_0c91694e3fef865a71cf808e7b9" PRIMARY KEY ("telegramUserId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "object_types" ("objectType" character varying NOT NULL, CONSTRAINT "PK_9039c1f53d943f1080d0055b4b0" PRIMARY KEY ("objectType"))`,
    );
    await queryRunner.query(`INSERT INTO object_types VALUES ('request'), ('issue');`);
    await queryRunner.query(
      `CREATE TABLE "projects" ("projectId" character varying NOT NULL, "instanceId" character varying NOT NULL, "name" character varying NOT NULL, "pathname" character varying NOT NULL, CONSTRAINT "PK_a240d9519344feb712d745cb388" PRIMARY KEY ("projectId", "instanceId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "observable_objects" ("objectId" character varying NOT NULL, "instanceId" character varying NOT NULL, "projectId" character varying NOT NULL, "objectType" character varying NOT NULL, "pathname" character varying NOT NULL, CONSTRAINT "PK_6660c3692e9c669b4e101f79cb7" PRIMARY KEY ("objectId", "instanceId", "projectId", "objectType"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscriptions" ("instanceUserId" character varying NOT NULL, "objectId" character varying NOT NULL, "instanceId" character varying NOT NULL, "projectId" character varying NOT NULL, "objectType" character varying NOT NULL, "isSubscribed" boolean NOT NULL, CONSTRAINT "PK_af4eb2db49cd904e74724c80043" PRIMARY KEY ("instanceUserId", "objectId", "instanceId", "projectId", "objectType"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "instance_users" ADD CONSTRAINT "FK_5f61f7b510028b31495d3cce5c5" FOREIGN KEY ("telegramUserId") REFERENCES "telegram_users"("telegramUserId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "instance_users" ADD CONSTRAINT "FK_c29663fe3fdf0965b33f9734ef1" FOREIGN KEY ("instanceId") REFERENCES "instances"("instanceId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_135a45ff7462c17b96482c3da44" FOREIGN KEY ("instanceId") REFERENCES "instances"("instanceId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "observable_objects" ADD CONSTRAINT "FK_b0556d711a022cbbe9c6fdbbbd6" FOREIGN KEY ("projectId", "instanceId") REFERENCES "projects"("projectId","instanceId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "observable_objects" ADD CONSTRAINT "FK_56966fac82df9562a1a244ece06" FOREIGN KEY ("objectType") REFERENCES "object_types"("objectType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_c9573274c5dcdbfde949510c0f6" FOREIGN KEY ("objectId", "instanceId", "projectId", "objectType") REFERENCES "observable_objects"("objectId","instanceId","projectId","objectType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_94304a1614c818d53db55ae9a72" FOREIGN KEY ("instanceId", "instanceUserId") REFERENCES "instance_users"("instanceId","instanceUserId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_94304a1614c818d53db55ae9a72"`);
    await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_c9573274c5dcdbfde949510c0f6"`);
    await queryRunner.query(`ALTER TABLE "observable_objects" DROP CONSTRAINT "FK_56966fac82df9562a1a244ece06"`);
    await queryRunner.query(`ALTER TABLE "observable_objects" DROP CONSTRAINT "FK_b0556d711a022cbbe9c6fdbbbd6"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_135a45ff7462c17b96482c3da44"`);
    await queryRunner.query(`ALTER TABLE "instance_users" DROP CONSTRAINT "FK_c29663fe3fdf0965b33f9734ef1"`);
    await queryRunner.query(`ALTER TABLE "instance_users" DROP CONSTRAINT "FK_5f61f7b510028b31495d3cce5c5"`);
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP TABLE "observable_objects"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TABLE "object_types"`);
    await queryRunner.query(`DROP TABLE "telegram_users"`);
    await queryRunner.query(`DROP TABLE "instance_users"`);
    await queryRunner.query(`DROP TABLE "instances"`);
    await queryRunner.query(`DROP TYPE "public"."GitProviders"`);
  }
}
