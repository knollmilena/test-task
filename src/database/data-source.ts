import { DataSource, DataSourceOptions } from 'typeorm';
import 'reflect-metadata';
import 'dotenv/config';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

const options: DataSourceOptions = {
	type: 'postgres',
	host: configService.get('DB_HOST'),
	port: Number(configService.get('DB_PORT')),
	username: configService.get('DB_USER'),
	password: configService.get('DB_PASSWORD'),
	database: configService.get('DB_NAME'),
	migrations: ['dist/src/database/migrations/*{.ts,.js}'],
	entities: [__dirname + '/../**/*.entity{.ts,.js}'],
};

export const dataSource = new DataSource(options);
