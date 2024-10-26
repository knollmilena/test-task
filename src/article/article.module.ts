import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from './entities/article.entity';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { UserEntity } from '../users/entities/user.entity';
import { UserModule } from '../users/users.module';
import { RedisService } from '../redis/redis.service';
import { JwtCoreModule } from '../auth/jwt.module';

@Module({
	imports: [TypeOrmModule.forFeature([ArticleEntity, UserEntity]), JwtCoreModule, UserModule],
	controllers: [ArticleController],
	providers: [ArticleService, RedisService],
})
export class ArticleModule {}
