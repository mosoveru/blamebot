import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class InitDatabase1744969724977 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'services',
        columns: [
          {
            name: 'serviceId',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'remoteName',
            type: 'varchar',
          },
          {
            name: 'gitProvider',
            type: 'varchar',
          },
          {
            name: 'serviceUrl',
            type: 'varchar',
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'projects',
        columns: [
          {
            name: 'projectId',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'serviceId',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'projectUrl',
            type: 'varchar',
          },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'projects',
      new TableForeignKey({
        columnNames: ['serviceId'],
        referencedColumnNames: ['serviceId'],
        referencedTableName: 'services',
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: 'object_types',
        columns: [
          {
            name: 'objectType',
            type: 'varchar',
            isPrimary: true,
          },
        ],
      }),
    );

    await queryRunner.query(`INSERT INTO object_types ("objectType") VALUES ('request');`);
    await queryRunner.query(`INSERT INTO object_types ("objectType") VALUES ('issue');`);

    await queryRunner.createTable(
      new Table({
        name: 'subscribers',
        columns: [
          {
            name: 'telegramUserId',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'username',
            type: 'varchar',
          },
          {
            name: 'name',
            type: 'varchar',
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'service_users',
        columns: [
          {
            name: 'serviceUserId',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'serviceId',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'telegramUserId',
            type: 'varchar',
          },
          {
            name: 'username',
            type: 'varchar',
          },
          {
            name: 'email',
            type: 'varchar',
          },
          {
            name: 'profileUrl',
            type: 'varchar',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('service_users', [
      new TableForeignKey({
        columnNames: ['serviceId'],
        referencedColumnNames: ['serviceId'],
        referencedTableName: 'services',
      }),
      new TableForeignKey({
        columnNames: ['telegramUserId'],
        referencedColumnNames: ['telegramUserId'],
        referencedTableName: 'subscribers',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'observable_objects',
        columns: [
          {
            name: 'objectId',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'serviceId',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'projectId',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'objectType',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'objectUrl',
            type: 'varchar',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('observable_objects', [
      new TableForeignKey({
        columnNames: ['projectId', 'serviceId'],
        referencedColumnNames: ['projectId', 'serviceId'],
        referencedTableName: 'projects',
      }),
      new TableForeignKey({
        columnNames: ['objectType'],
        referencedColumnNames: ['objectType'],
        referencedTableName: 'object_types',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'subscriptions',
        columns: [
          {
            name: 'serviceUserId',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'objectId',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'serviceId',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'projectId',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'objectType',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'isSubscribed',
            type: 'boolean',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('subscriptions', [
      new TableForeignKey({
        columnNames: ['objectId', 'serviceId', 'projectId', 'objectType'],
        referencedColumnNames: ['objectId', 'serviceId', 'projectId', 'objectType'],
        referencedTableName: 'observable_objects',
      }),
      new TableForeignKey({
        columnNames: ['serviceUserId', 'serviceId'],
        referencedColumnNames: ['serviceUserId', 'serviceId'],
        referencedTableName: 'service_users',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('subscriptions');
    await queryRunner.dropTable('service_users');
    await queryRunner.dropTable('observable_objects');
    await queryRunner.dropTable('subscribers');
    await queryRunner.dropTable('projects');
    await queryRunner.dropTable('object_types');
    await queryRunner.dropTable('services');
  }
}
