import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTokensTable1729811389113 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'token',
				columns: [
					{
						name: 'id',
						type: 'int',
						isGenerated: true,
						generationStrategy: 'increment',
						isPrimary: true,
					},
					{
						name: 'token',
						type: 'varchar',
					},
					{
						name: 'exp',
						type: 'varchar',
					},
					{
						name: 'validUntil',
						type: 'varchar',
						isNullable: true,
					},
					{
						name: 'userId',
						type: 'int',
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

		await queryRunner.createForeignKey(
			'token',
			new TableForeignKey({
				columnNames: ['userId'],
				referencedColumnNames: ['id'],
				referencedTableName: 'users',
				onDelete: 'CASCADE',
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const tokenTable = await queryRunner.getTable('token');
		const tokenForeignKey = tokenTable.foreignKeys.find(
			(fk) => fk.columnNames.indexOf('userId') !== -1,
		);
		await queryRunner.dropForeignKey('token', tokenForeignKey);

		await queryRunner.dropTable('token');
	}
}
