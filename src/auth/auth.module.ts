import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenEntity } from './entities/token.entity';
import { JwtCoreModule } from './jwt.module';

@Module({
	imports: [TypeOrmModule.forFeature([TokenEntity]), JwtCoreModule, UserModule],
	controllers: [AuthController],
	providers: [AuthService],
})
export class AuthModule {}
