import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class InitDatabase1744969724977 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'instances',
        columns: [
          {
            name: 'instanceId',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'instanceName',
            type: 'varchar',
          },
          {
            name: 'gitProvider',
            type: 'enum',
            enum: ['GITLAB', 'GITEA'],
            enumName: 'GitProviders',
          },
          {
            name: 'serviceBaseUrl',
            type: 'varchar',
            isUnique: true,
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
            name: 'instanceId',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'pathname',
            type: 'varchar',
          },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'projects',
      new TableForeignKey({
        columnNames: ['instanceId'],
        referencedColumnNames: ['instanceId'],
        referencedTableName: 'instances',
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: 'object_types',
        columns: [
          {
            name: 'objectType',
            type: 'enum',
            enum: ['issue', 'request'],
            enumName: 'GitObjectTypes',
            isPrimary: true,
          },
        ],
      }),
    );

    await queryRunner.query(`INSERT INTO object_types ("objectType") VALUES ('request');`);
    await queryRunner.query(`INSERT INTO object_types ("objectType") VALUES ('issue');`);

    await queryRunner.createTable(
      new Table({
        name: 'telegram_users',
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
        name: 'instance_users',
        columns: [
          {
            name: 'instanceUserId',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'instanceId',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'telegramUserId',
            type: 'varchar',
            isNullable: false,
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
            name: 'pathname',
            type: 'varchar',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('instance_users', [
      new TableForeignKey({
        columnNames: ['instanceId'],
        referencedColumnNames: ['instanceId'],
        referencedTableName: 'instances',
      }),
      new TableForeignKey({
        columnNames: ['telegramUserId'],
        referencedColumnNames: ['telegramUserId'],
        referencedTableName: 'telegram_users',
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
            name: 'instanceId',
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
            type: 'enum',
            enum: ['issue', 'request'],
            enumName: 'GitObjectTypes',
            isPrimary: true,
          },
          {
            name: 'pathname',
            type: 'varchar',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('observable_objects', [
      new TableForeignKey({
        columnNames: ['projectId', 'instanceId'],
        referencedColumnNames: ['projectId', 'instanceId'],
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
            name: 'instanceUserId',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'objectId',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'instanceId',
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
            type: 'enum',
            enum: ['issue', 'request'],
            enumName: 'GitObjectTypes',
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
        columnNames: ['objectId', 'instanceId', 'projectId', 'objectType'],
        referencedColumnNames: ['objectId', 'instanceId', 'projectId', 'objectType'],
        referencedTableName: 'observable_objects',
      }),
      new TableForeignKey({
        columnNames: ['instanceUserId', 'instanceId'],
        referencedColumnNames: ['instanceUserId', 'instanceId'],
        referencedTableName: 'instance_users',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('subscriptions');
    await queryRunner.dropTable('instance_users');
    await queryRunner.dropTable('observable_objects');
    await queryRunner.dropTable('telegram_users');
    await queryRunner.dropTable('projects');
    await queryRunner.dropTable('object_types');
    await queryRunner.dropTable('instances');
  }
}
