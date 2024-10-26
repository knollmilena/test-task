import { Test, TestingModule } from '@nestjs/testing';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { RedisService } from '../redis/redis.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { FilterArticlesDto } from './dto/filter-article.dto';
import { ArticleEntity } from './entities/article.entity';
import { DeleteArticleResponse } from './types/delete-article.interface';
import { JwtCoreModule } from '../auth/jwt.module';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

describe('ArticleController', () => {
	let articleController: ArticleController;
	let articleService: ArticleService;

	const mockArticleService = {
		getAll: jest.fn(),
		getOneById: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	};

	const mockRedisService = {
		get: jest.fn(),
		set: jest.fn(),
		cacheHandler: jest.fn(),
		deleteCache: jest.fn(),
		close: jest.fn().mockImplementation(async () => {
			console.log('Mock Redis connection closed');
		}),
	};

	const mockConfigService = {
		get: jest.fn((key: string) => {
			if (key === 'JWT_SECRET') {
				return 'secretKey';
			}
			if (key === 'JWT_EXPIRES') {
				return '60s';
			}
			return null;
		}),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [JwtCoreModule],
			controllers: [ArticleController],
			providers: [
				{ provide: ArticleService, useValue: mockArticleService },
				{ provide: RedisService, useValue: mockRedisService },
				{ provide: ConfigService, useValue: mockConfigService },
			],
		}).compile();

		articleController = module.get<ArticleController>(ArticleController);
		articleService = module.get<ArticleService>(ArticleService);
	});

	describe('getAll', () => {
		it('должен вернуть список статей с информацией о нумерации страниц', async () => {
			const filterDto: FilterArticlesDto = {
				limit: 10,
				skip: 0,
				startDate: undefined,
				endDate: undefined,
				authorId: undefined,
				firstname: undefined,
				lastname: undefined,
				patronymic: undefined,
			};
			const result = { items: [], paginationInfo: { total: 0 } };
			mockRedisService.cacheHandler.mockImplementation(() => Promise.resolve(result));

			expect(await articleController.getAll(filterDto, {} as any)).toEqual(result);
			expect(mockRedisService.cacheHandler).toHaveBeenCalled();
			expect(articleService.getAll).not.toHaveBeenCalled();
		});
	});

	describe('getOne', () => {
		it('должен вернуть статью по идентификатору из кеша', async () => {
			const id = 1;
			const cacheKey = `/articles/${id}`;
			const mockRequest = {
				originalUrl: cacheKey,
			} as Request;

			const article = new ArticleEntity();
			article.id = id;
			article.title = 'Test Article';

			(mockRedisService.cacheHandler as jest.Mock).mockResolvedValue(article);

			const result = await articleController.getOne(id, mockRequest);

			expect(result).toEqual(article);
			expect(mockRedisService.cacheHandler).toHaveBeenCalledWith(cacheKey, expect.any(Function));
			expect(articleService.getOneById).not.toHaveBeenCalled();
		});

		it('должен получить статью, если ее нет в кеше', async () => {
			const id = 1;
			const cacheKey = `/articles/${id}`;
			const mockRequest = {
				originalUrl: cacheKey,
			} as Request;

			const article = new ArticleEntity();
			article.id = id;
			article.title = 'Test Article';

			(mockRedisService.cacheHandler as jest.Mock).mockImplementation(
				async (key, fetchFunction) => {
					return await fetchFunction();
				},
			);

			(articleService.getOneById as jest.Mock).mockResolvedValue(article);

			const result = await articleController.getOne(id, mockRequest);

			expect(result).toEqual(article);
			expect(mockRedisService.cacheHandler).toHaveBeenCalledWith(cacheKey, expect.any(Function));
			expect(articleService.getOneById).toHaveBeenCalledWith(id);
		});
	});

	describe('create', () => {
		it('надо создать новую статью', async () => {
			const createDto: CreateArticleDto = {
				title: 'Test Title',
				description: 'Test description',
				authorId: 1,
			};
			const article = new ArticleEntity();
			mockRedisService.deleteCache.mockImplementation(() => Promise.resolve());
			mockArticleService.create.mockImplementation(() => Promise.resolve(article));

			expect(await articleController.create(createDto)).toEqual(article);
			expect(mockRedisService.deleteCache).toHaveBeenCalledWith(`/articles?*`);
		});
	});

	describe('update', () => {
		it('следует обновить статью и удалить кеш', async () => {
			const dto: UpdateArticleDto = {
				id: 1,
				title: 'Updated Title',
				description: undefined,
				authorId: undefined,
			};
			const updatedArticle = new ArticleEntity();
			updatedArticle.id = dto.id;
			updatedArticle.title = dto.title;

			(articleService.getOneById as jest.Mock).mockResolvedValue(updatedArticle);
			(articleService.update as jest.Mock).mockResolvedValue(updatedArticle);

			const result = await articleController.update(dto);

			expect(result).toEqual(updatedArticle);
			expect(mockRedisService.deleteCache).toHaveBeenCalledWith(`/articles/${dto.id}`);
			expect(mockRedisService.deleteCache).toHaveBeenCalledWith(`/articles?*`);
			expect(articleService.update).toHaveBeenCalledWith(dto);
		});
	});

	describe('deleteUser', () => {
		it('следует удалить статью по идентификатору', async () => {
			const id = 1;
			const response: DeleteArticleResponse = {
				success: true,
				message: 'Article deleted successfully',
			};
			mockArticleService.delete.mockImplementation(() => Promise.resolve(response));
			mockRedisService.deleteCache.mockImplementation(() => Promise.resolve());

			expect(await articleController.deleteUser(id)).toEqual(response);
			expect(mockRedisService.deleteCache).toHaveBeenCalledWith(`/articles/${id}`);
			expect(mockRedisService.deleteCache).toHaveBeenCalledWith(`/articles?*`);
		});
	});

	afterAll(async () => {
		await mockRedisService.close();
	});
});
