import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOnDeleteCascade1750060339654 implements MigrationInterface {
  name = 'AddOnDeleteCascade1750060339654';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "instance_users" DROP CONSTRAINT "FK_c29663fe3fdf0965b33f9734ef1"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_135a45ff7462c17b96482c3da44"`);
    await queryRunner.query(`ALTER TABLE "observable_objects" DROP CONSTRAINT "FK_b0556d711a022cbbe9c6fdbbbd6"`);
    await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_c9573274c5dcdbfde949510c0f6"`);
    await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_94304a1614c818d53db55ae9a72"`);
    await queryRunner.query(
      `ALTER TABLE "instance_users" ADD CONSTRAINT "FK_c29663fe3fdf0965b33f9734ef1" FOREIGN KEY ("instanceId") REFERENCES "instances"("instanceId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_135a45ff7462c17b96482c3da44" FOREIGN KEY ("instanceId") REFERENCES "instances"("instanceId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "observable_objects" ADD CONSTRAINT "FK_b0556d711a022cbbe9c6fdbbbd6" FOREIGN KEY ("projectId", "instanceId") REFERENCES "projects"("projectId","instanceId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_c9573274c5dcdbfde949510c0f6" FOREIGN KEY ("objectId", "instanceId", "projectId", "objectType") REFERENCES "observable_objects"("objectId","instanceId","projectId","objectType") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_94304a1614c818d53db55ae9a72" FOREIGN KEY ("instanceId", "instanceUserId") REFERENCES "instance_users"("instanceId","instanceUserId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_94304a1614c818d53db55ae9a72"`);
    await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_c9573274c5dcdbfde949510c0f6"`);
    await queryRunner.query(`ALTER TABLE "observable_objects" DROP CONSTRAINT "FK_b0556d711a022cbbe9c6fdbbbd6"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_135a45ff7462c17b96482c3da44"`);
    await queryRunner.query(`ALTER TABLE "instance_users" DROP CONSTRAINT "FK_c29663fe3fdf0965b33f9734ef1"`);
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_94304a1614c818d53db55ae9a72" FOREIGN KEY ("instanceId", "instanceUserId") REFERENCES "instance_users"("instanceId","instanceUserId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_c9573274c5dcdbfde949510c0f6" FOREIGN KEY ("objectId", "instanceId", "projectId", "objectType") REFERENCES "observable_objects"("objectId","instanceId","projectId","objectType") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "observable_objects" ADD CONSTRAINT "FK_b0556d711a022cbbe9c6fdbbbd6" FOREIGN KEY ("projectId", "instanceId") REFERENCES "projects"("projectId","instanceId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_135a45ff7462c17b96482c3da44" FOREIGN KEY ("instanceId") REFERENCES "instances"("instanceId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "instance_users" ADD CONSTRAINT "FK_c29663fe3fdf0965b33f9734ef1" FOREIGN KEY ("instanceId") REFERENCES "instances"("instanceId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
