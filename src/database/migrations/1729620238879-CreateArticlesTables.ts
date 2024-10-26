import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateArticlesTable1729620238879 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'articles',
				columns: [
					{
						name: 'id',
						type: 'int',
						isGenerated: true,
						generationStrategy: 'increment',
						isPrimary: true,
					},
					{
						name: 'title',
						type: 'varchar',
					},
					{
						name: 'description',
						type: 'text',
					},
					{
						name: 'authorId',
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
			'articles',
			new TableForeignKey({
				columnNames: ['authorId'],
				referencedColumnNames: ['id'],
				referencedTableName: 'users',
				onDelete: 'CASCADE',
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const table = await queryRunner.getTable('articles');
		const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf('authorId') !== -1);
		await queryRunner.dropForeignKey('articles', foreignKey);

		await queryRunner.dropTable('articles');
	}
}
