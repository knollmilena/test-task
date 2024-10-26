import { ConfigModuleOptions } from '@nestjs/config';
import * as Joi from 'joi';

export const configModuleOptions: ConfigModuleOptions = {
	isGlobal: true,
	validationSchema: Joi.object({
		PORT: Joi.number(),
		DB_HOST: Joi.string().required(),
		DB_PORT: Joi.number().required(),
		DB_USER: Joi.string().required(),
		DB_PASSWORD: Joi.string().required(),
		DB_NAME: Joi.string().required(),
		JWT_SECRET: Joi.string().required(),
		JWT_EXPIRES: Joi.string().required(),
		COOKIE_KEY_NAME: Joi.string().required(),
		NODE_ENV: Joi.string().required(),
	}),
};
