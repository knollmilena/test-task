import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
	imports: [
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				return {
					secret: configService.get<string>('JWT_SECRET'),
					signOptions: {
						expiresIn: configService.get<string>('JWT_EXPIRES'),
					},
				};
			},
		}),
	],
	exports: [JwtModule],
})
export class JwtCoreModule {}
