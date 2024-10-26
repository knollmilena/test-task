import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleNotFoundException } from './exceptions/article-not-found.exceptions';
import { DeleteArticleResponse } from './types/delete-article.interface';
import { ARTICLE_DELETED } from '../common/messages/successfull.messages';
import { UserService } from '../users/users.service';
import { FilterArticlesDto } from './dto/filter-article.dto';
import { getPaginationInfo } from '../common/utils/get-pagination-info';
import { PaginationInfo } from '../common/types/pagination-info.interface';

@Injectable()
export class ArticleService {
	constructor(
		@InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>,
		private userService: UserService,
	) {}

	async getAll({
		skip = 0,
		limit = 10,
		startDate,
		endDate,
		authorId,
		firstname,
		lastname,
		patronymic,
	}: FilterArticlesDto): Promise<{ items: ArticleEntity[]; paginationInfo: PaginationInfo }> {
		const query = await this.articleRepository.createQueryBuilder('articles');

		if (startDate) {
			query.where('articles.createdAt >= :startDate', { startDate });
		}
		if (endDate) {
			query.andWhere('articles.createdAt <= :endDate', { endDate });
		}

		if (authorId) {
			query.andWhere('articles.authorId = :authorId', { authorId });
		}

		if (firstname || lastname || patronymic) {
			const users = await this.userService.getAll({ firstname, lastname, patronymic });

			if (users.items.length > 0) {
				const authorIds = users.items.map((user) => user.id);
				query.andWhere('articles.authorId IN (:...authorIds)', { authorIds });
			} else {
				return { items: [], paginationInfo: getPaginationInfo([], 0, limit, skip) };
			}
		}

		const [items, count] = await query
			.skip(skip * limit)
			.take(limit)
			.orderBy('articles.createdAt', 'ASC', 'NULLS LAST')
			.getManyAndCount();

		const paginationInfo = getPaginationInfo(items, count, limit, skip);
		return { items, paginationInfo };
	}

	async getOneById(id: number): Promise<ArticleEntity> {
		const article = await this.articleRepository.findOne({ where: { id } });
		if (!article) {
			throw new ArticleNotFoundException();
		}
		return article;
	}

	async create(dto: CreateArticleDto): Promise<ArticleEntity> {
		const author = await this.userService.getOneByParams({ id: dto.authorId });
		const article = await this.articleRepository.create(dto);
		article.author = author;

		return await this.articleRepository.save(article);
	}

	async update(dto: UpdateArticleDto): Promise<ArticleEntity> {
		await this.getOneById(dto.id);

		return await this.articleRepository.save(dto);
	}

	async delete(id: number): Promise<DeleteArticleResponse> {
		try {
			await this.getOneById(id);

			await this.articleRepository.delete(id);
			return { success: true, message: ARTICLE_DELETED };
		} catch (error) {
			return { success: false, message: error.message };
		}
	}
}
