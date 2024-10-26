import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
	.setTitle('Тестовое задание для QTIM')
	.setDescription('Документация API')
	.setVersion('1.0')
	.build();
