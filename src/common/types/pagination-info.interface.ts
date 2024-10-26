export interface PaginationInfo {
	totalItems: number;
	totalPages: number;
	page: number;
	perPage: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}
