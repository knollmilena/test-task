import { PaginationInfo } from '../types/pagination-info.interface';
import { getPaginationInfo } from './get-pagination-info';

describe('Тестируем функцию getPaginationInfo', () => {
	it('Должна вернуть корректные данные', () => {
		const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const count = 10;
		const limit = 2;
		const skip = 1;
		const result: PaginationInfo = getPaginationInfo(items, count, limit, skip);
		expect(result).toEqual({
			totalItems: 10,
			totalPages: 5,
			page: 2,
			perPage: 10,
			hasNextPage: true,
			hasPreviousPage: true,
		});
	});

	it('должен вернуть корректную hasPreviousPage если skip равен 0', () => {
		const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const count = 10;
		const limit = 5;
		const skip = 0;

		const result: PaginationInfo = getPaginationInfo(items, count, limit, skip);

		expect(result).toEqual({
			totalItems: 10,
			totalPages: 2,
			page: 1,
			perPage: 10,
			hasNextPage: true,
			hasPreviousPage: false,
		});
	});

	it('должен вернуть корректную totalPages если limit равен 0', () => {
		const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const count = 10;
		const limit = 0;
		const skip = 0;

		const result: PaginationInfo = getPaginationInfo(items, count, limit, skip);

		expect(result).toEqual({
			totalItems: 10,
			totalPages: 1,
			page: 1,
			perPage: 10,
			hasNextPage: false,
			hasPreviousPage: false,
		});
	});

	it('должен вернуть корректную информацию о пагинации для второй страницы', () => {
		const items = [4, 5, 6];
		const count = 3;
		const limit = 3;
		const skip = 0;

		const result: PaginationInfo = getPaginationInfo(items, count, limit, skip);

		expect(result).toEqual({
			totalItems: 3,
			totalPages: 1,
			page: 1,
			perPage: 3,
			hasNextPage: false,
			hasPreviousPage: false,
		});
	});

	it('должен обрабатывать пустой массив элементов', () => {
		const items: any[] = [];
		const count = 0;
		const limit = 3;
		const skip = 0;

		const result: PaginationInfo = getPaginationInfo(items, count, limit, skip);

		expect(result).toEqual({
			totalItems: 0,
			totalPages: 0,
			page: 0,
			perPage: 0,
			hasNextPage: false,
			hasPreviousPage: false,
		});
	});

	it('должен обрабатывать случай, когда нет следующей страницы', () => {
		const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const count = 10;
		const limit = 3;
		const skip = 6;

		const result: PaginationInfo = getPaginationInfo(items, count, limit, skip);

		expect(result).toEqual({
			totalItems: 10,
			totalPages: 4,
			page: 7,
			perPage: 0,
			hasNextPage: false,
			hasPreviousPage: true,
		});
	});
});
