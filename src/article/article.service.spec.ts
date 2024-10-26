import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { ArticleEntity } from './entities/article.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from '../users/users.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleNotFoundException } from './exceptions/article-not-found.exceptions';
import { DeleteArticleResponse } from './types/delete-article.interface';
import { FilterArticlesDto } from './dto/filter-article.dto';
import { ARTICLE_NOT_FOUND_EXCEPTION } from '../common/messages/error-messages';
import { ARTICLE_DELETED } from '../common/messages/successfull.messages';

describe('ArticleService', () => {
	let articleService: ArticleService;

	const mockArticleRepository = {
		findOne: jest.fn(),
		create: jest.fn(),
		save: jest.fn(),
		delete: jest.fn(),
		createQueryBuilder: jest.fn(),
	};

	const mockUserService = {
		getOneByParams: jest.fn(),
		getAll: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ArticleService,
				{ provide: getRepositoryToken(ArticleEntity), useValue: mockArticleRepository },
				{ provide: UserService, useValue: mockUserService },
			],
		}).compile();

		articleService = module.get<ArticleService>(ArticleService);
	});

	describe('getAll', () => {
		it('должен вернуть список статей и информацию о страницах', async () => {
			const filterDto: FilterArticlesDto = {
				skip: 0,
				limit: 10,
				startDate: undefined,
				endDate: undefined,
				authorId: undefined,
				firstname: undefined,
				lastname: undefined,
				patronymic: undefined,
			};

			const articles = [new ArticleEntity(), new ArticleEntity()];
			const count = articles.length;

			mockArticleRepository.createQueryBuilder.mockReturnValue({
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				skip: jest.fn().mockReturnThis(),
				take: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getManyAndCount: jest.fn().mockResolvedValue([articles, count]),
			});

			const result = await articleService.getAll(filterDto);

			expect(result).toEqual({
				items: articles,
				paginationInfo: {
					totalItems: count,
					totalPages: 1,
					page: 1,
					perPage: 2,
					hasNextPage: false,
					hasPreviousPage: false,
				},
			});
		});

		it('должен возвращать пустой массив и информацию о нумерации страниц, если авторы не найдены', async () => {
			const filterDto: FilterArticlesDto = {
				skip: 0,
				limit: 10,
				firstname: 'John',
				startDate: undefined,
				endDate: undefined,
				authorId: undefined,
				lastname: undefined,
				patronymic: undefined,
			};

			mockUserService.getAll.mockResolvedValue({ items: [] });

			const result = await articleService.getAll(filterDto);

			expect(result).toEqual({
				items: [],
				paginationInfo: {
					totalItems: 0,
					totalPages: 0,
					page: 0,
					perPage: 0,
					hasNextPage: false,
					hasPreviousPage: false,
				},
			});
		});
	});

	describe('getOneById', () => {
		it('должен вернуть статью по идентификатору', async () => {
			const article = new ArticleEntity();
			article.id = 1;

			mockArticleRepository.findOne.mockResolvedValue(article);

			const result = await articleService.getOneById(1);

			expect(result).toEqual(article);
			expect(mockArticleRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
		});

		it('должен выдать исключение ArticleNotFoundException, если статья не существует', async () => {
			mockArticleRepository.findOne.mockResolvedValue(null);

			await expect(articleService.getOneById(999)).rejects.toThrow(ArticleNotFoundException);
		});
	});

	describe('create', () => {
		it('надо создать новую статью', async () => {
			const dto: CreateArticleDto = {
				title: 'Test Article',
				authorId: 1,
				description:
					'В мире технологий и информации мы сталкиваемся с постоянным потоком новостей и обновлений. Каждодневные изменения в науке, культуре и общественной жизни требуют от нас внимания и осмысленного подхода. Важно не только следить за событиями, но и понимать их значение. Каждый из нас может внести свой вклад в общественное обсуждение, делясь мнением и идеями. Будьте активными участниками в формировании будущего!',
			};
			const author = { id: 1, name: 'Author Name' };
			const article = new ArticleEntity();

			mockUserService.getOneByParams.mockResolvedValue(author);
			mockArticleRepository.create.mockReturnValue(article);
			mockArticleRepository.save.mockResolvedValue(article);

			const result = await articleService.create(dto);

			expect(result).toEqual(article);
			expect(mockUserService.getOneByParams).toHaveBeenCalledWith({ id: dto.authorId });
			expect(mockArticleRepository.create).toHaveBeenCalledWith(dto);
			expect(mockArticleRepository.save).toHaveBeenCalledWith(article);
		});
	});

	describe('update', () => {
		it('должен обновить статью', async () => {
			const dto: UpdateArticleDto = {
				id: 1,
				title: 'Updated Title',
				authorId: undefined,
				description:
					'В мире технологий и информации мы сталкиваемся с постоянным потоком новостей и обновлений. Каждодневные изменения в науке, культуре и общественной жизни требуют от нас внимания и осмысленного подхода. Важно не только следить за событиями, но и понимать их значение. Каждый из нас может внести свой вклад в общественное обсуждение, делясь мнением и идеями. Будьте активными участниками в формировании будущего!',
			};
			const article = new ArticleEntity();
			article.id = dto.id;
			article.title = 'Old Title';

			mockArticleRepository.findOne.mockResolvedValue(article);
			mockArticleRepository.save.mockResolvedValue({ ...article, title: dto.title });

			const result = await articleService.update(dto);

			expect(result.title).toBe(dto.title);
			expect(mockArticleRepository.save).toHaveBeenCalledWith(dto);
		});
	});

	describe('delete', () => {
		it('должен удалить статью', async () => {
			const id = 1;
			const response: DeleteArticleResponse = {
				success: true,
				message: ARTICLE_DELETED,
			};

			mockArticleRepository.findOne.mockResolvedValue(new ArticleEntity())
			mockArticleRepository.delete.mockResolvedValue(undefined);

			const result = await articleService.delete(id);

			expect(result).toEqual(response);
			expect(mockArticleRepository.findOne).toHaveBeenCalledWith({ where: { id } });
			expect(mockArticleRepository.delete).toHaveBeenCalledWith(id);
		});

		it('должен возвращать сообщение об ошибке, если статья не существует', async () => {
			const id = 999;

			mockArticleRepository.findOne.mockResolvedValue(null);

			const result = await articleService.delete(id);

			expect(result).toEqual({ success: false, message: ARTICLE_NOT_FOUND_EXCEPTION });
		});
	});
});
