import { Module } from '@nestjs/common';
import { configModuleOptions } from './config/config-module.options';
import { UserModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { ArticleModule } from './article/article.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { JwtCoreModule } from './auth/jwt.module';

@Module({
	imports: [
		ConfigModule.forRoot(configModuleOptions),
		DatabaseModule,
		JwtCoreModule,
		AuthModule,
		UserModule,
		ArticleModule,
	],
})
export class AppModule {}
