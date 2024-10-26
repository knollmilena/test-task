import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './config/swagger.config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.use(cookieParser());

	app.useGlobalPipes(new ValidationPipe({ transform: true }));
	const configService: ConfigService = app.get(ConfigService);

	const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup('api', app, swaggerDocument);

	app.listen(configService.get(`PORT`), () =>
		console.log(`http://localhost:${configService.get(`PORT`)}/api#`),
	);
}

bootstrap();
