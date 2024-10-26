import { PaginationInfo } from '../types/pagination-info.interface';

export function getPaginationInfo(
	items: any[],
	count: number,
	limit: number = 0,
	skip: number = 0,
): PaginationInfo {
	return {
		totalItems: count,
		totalPages: limit > 0 ? Math.ceil(count / limit) : 1,
		page: (limit > 0 ? Math.ceil(count / limit) : 1) === 0 ? skip : skip + 1,
		perPage: Math.ceil(items.length / limit) < skip ? 0 : items.length,
		hasNextPage: limit === 0 ? false : (skip + 1) * limit < count,
		hasPreviousPage: skip > 0,
	};
}
