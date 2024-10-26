import {
	Controller,
	Get,
	Delete,
	Query,
	Body,
	Post,
	ParseIntPipe,
	Put,
	Param,
	Req,
	UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleEntity } from './entities/article.entity';
import { UpdateArticleDto } from './dto/update-article.dto';
import { DeleteArticleResponse } from './types/delete-article.interface';
import { FilterArticlesDto } from './dto/filter-article.dto';
import { PaginationInfo } from '../common/types/pagination-info.interface';
import { Request } from 'express';
import { RedisService } from '../redis/redis.service';
import { AuthGuard } from '../common/decorators/auth.guard';

@ApiTags('Статьи')
@Controller('articles')
export class ArticleController {
	constructor(
		private readonly articleService: ArticleService,
		private readonly redisService: RedisService,
	) {}

	@ApiOperation({ summary: 'получить все статьи' })
	@ApiQuery({ name: 'skip', required: false, type: Number })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	@ApiQuery({ name: 'startDate', required: false, type: String })
	@ApiQuery({ name: 'endDate', required: false, type: String })
	@ApiQuery({ name: 'authorId', required: false, type: Number })
	@ApiQuery({ name: 'firstname', required: false, type: String })
	@ApiQuery({ name: 'lastname', required: false, type: String })
	@ApiQuery({ name: 'patronymic', required: false, type: String })
	@Get()
	async getAll(
		@Query() dto: FilterArticlesDto,
		@Req() request: Request,
	): Promise<{ items: ArticleEntity[]; paginationInfo: PaginationInfo }> {
		const cacheKey = request.originalUrl;

		return this.redisService.cacheHandler(cacheKey, () => this.articleService.getAll(dto));
	}

	@ApiOperation({ summary: 'найти статью по id' })
	@ApiParam({ name: 'id', type: Number, description: 'ID статьи' })
	@Get(':id')
	async getOne(
		@Param('id', ParseIntPipe) id: number,
		@Req() request: Request,
	): Promise<ArticleEntity> {
		const cacheKey = request.originalUrl;

		return this.redisService.cacheHandler(cacheKey, () => this.articleService.getOneById(id));
	}

	@UseGuards(AuthGuard)
	@ApiOperation({ summary: 'создать статью' })
	@Post()
	async create(@Body() dto: CreateArticleDto): Promise<ArticleEntity> {
		await this.redisService.deleteCache(`/articles?*`);

		return this.articleService.create(dto);
	}

	@UseGuards(AuthGuard)
	@ApiOperation({ summary: 'обновить статью' })
	@Put()
	async update(@Body() dto: UpdateArticleDto): Promise<ArticleEntity> {
		await this.redisService.deleteCache(`/articles/${dto.id}`);
		await this.redisService.deleteCache(`/articles?*`);

		return this.articleService.update(dto);
	}

	@ApiOperation({ summary: 'удалить статью по id' })
	@Delete('delete')
	async deleteUser(@Query('id', new ParseIntPipe()) id?: number): Promise<DeleteArticleResponse> {
		const responce = await this.articleService.delete(id);

		if (responce.success) {
			await this.redisService.deleteCache(`/articles/${id}`);
			await this.redisService.deleteCache(`/articles?*`);
		}

		return responce;
	}
}
