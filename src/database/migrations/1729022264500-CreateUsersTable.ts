import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1729022264500 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'users',
				columns: [
					{
						name: 'id',
						type: 'int',
						isGenerated: true,
						generationStrategy: 'increment',
						isPrimary: true,
					},
					{
						name: 'firstname',
						type: 'varchar',
					},
					{
						name: 'lastname',
						type: 'varchar',
					},
					{
						name: 'patronymic',
						type: 'varchar',
						isNullable: true,
					},
					{
						name: 'email',
						type: 'varchar',
						isUnique: true,
					},
					{
						name: 'password',
						type: 'varchar',
					},
					{
						name: 'createdAt',
						type: 'timestamp',
						default: 'CURRENT_TIMESTAMP',
					},
					{
						name: 'updatedAt',
						type: 'timestamp',
						default: 'CURRENT_TIMESTAMP',
						onUpdate: 'CURRENT_TIMESTAMP',
					},
					{
						name: 'deletedAt',
						type: 'timestamp',
						isNullable: true,
					},
				],
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('users');
	}
}
