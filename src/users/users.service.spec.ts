import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserNotFoundException } from './exceptions/user-not-found.exceptions';
import { UserDoubleException } from './exceptions/user-double.exceptions';
import { UserService } from './users.service';
import { FilterUsersDto } from './dto/filter-users.dto';

describe('User Service', () => {
	let service: UserService;

	const mockUser = {
		findOne: jest.fn(),
		find: jest.fn(),
		create: jest.fn(),
		save: jest.fn(),
		delete: jest.fn(),
		createQueryBuilder: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{
					provide: getRepositoryToken(UserEntity),
					useValue: mockUser,
				},
			],
		}).compile();

		service = module.get<UserService>(UserService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('create', () => {
		it('должно успешно создать пользователя', async () => {
			const createUserDto: CreateUserDto = {
				firstname: 'John',
				lastname: 'Doe',
				email: 'john.doe@example.com',
				password: 'password123',
			};

			mockUser.findOne.mockResolvedValue(null);
			mockUser.create.mockReturnValue(createUserDto);
			mockUser.save.mockResolvedValue({
				...createUserDto,
				id: 1,
			});

			const result = await service.create(createUserDto);

			expect(result).toEqual({
				id: 1,
				firstname: 'John',
				lastname: 'Doe',
				email: 'john.doe@example.com',
			});

			expect(mockUser.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
			expect(mockUser.save).toHaveBeenCalled();
		});

		it('должен выдать UserDoubleException, если пользователь уже существует', async () => {
			const createUserDto: CreateUserDto = {
				firstname: 'John',
				lastname: 'Doe',
				email: 'john.doe@example.com',
				password: 'password123',
			};

			mockUser.findOne.mockResolvedValue(createUserDto);

			await expect(service.create(createUserDto)).rejects.toThrow(UserDoubleException);
		});
	});

	describe('getOneByParams', () => {
		it('должен вернуть пользователя по идентификатору', async () => {
			const user = { id: 1, firstname: 'John', lastname: 'Doe', email: 'john.doe@example.com' };
			mockUser.findOne.mockResolvedValue(user);

			const result = await service.getOneByParams({ id: 1 });
			expect(result).toEqual(user);
		});

		it('должен выдать UserNotFoundException, если пользователь не существует', async () => {
			mockUser.findOne.mockResolvedValue(null);

			await expect(service.getOneByParams({ id: 1 })).rejects.toThrow(UserNotFoundException);
		});
	});

	describe('update', () => {
		it('должен обновить пользователя', async () => {
			const updateUserDto: UpdateUserDto = {
				id: 1,
				firstname: 'John',
				lastname: 'Doe',
				email: 'john.doe@example.com',
				password: '123456789',
			};

			const user = { id: 1, firstname: 'Old', lastname: 'Name', email: 'old.email@example.com' };
			mockUser.findOne.mockResolvedValue(user);
			mockUser.save.mockResolvedValue({ ...user, ...updateUserDto });

			await service.update(updateUserDto);
			expect(mockUser.save).toHaveBeenCalledWith({ ...user, ...updateUserDto });
		});

		it('должен выдать UserNotFoundException, если пользователь не существует', async () => {
			const updateUserDto: UpdateUserDto = {
				id: 1,
				firstname: 'John',
				lastname: undefined,
				patronymic: undefined,
				email: undefined,
				password: undefined,
			};
			mockUser.findOne.mockResolvedValue(null);

			await expect(service.update(updateUserDto)).rejects.toThrow(UserNotFoundException);
		});
	});

	describe('delete', () => {
		it('должно успешно удалить пользователя', async () => {
			const userId = 1;
			const user = {
				id: userId,
				firstname: 'John',
				lastname: 'Doe',
				email: 'john.doe@example.com',
			};
			mockUser.findOne.mockResolvedValue(user);
			mockUser.delete.mockResolvedValue({ affected: 1 });

			await service.delete(userId);
			expect(mockUser.findOne).toHaveBeenCalledWith({ where: { id: userId } });
			expect(mockUser.delete).toHaveBeenCalledWith({ id: userId });
		});

		it('должен выдать UserNotFoundException, если пользователь не существует', async () => {
			const userId = 1;
			mockUser.findOne.mockResolvedValue(null);

			await expect(service.delete(userId)).rejects.toThrow(UserNotFoundException);
		});
	});

	describe('softDelete', () => {
		it('должно быть успешно удалено программное обеспечение пользователя', async () => {
			const userId = 1;
			const user = {
				id: userId,
				firstname: 'John',
				lastname: 'Doe',
				email: 'john.doe@example.com',
				deletedAt: null,
			};
			mockUser.findOne.mockResolvedValue(user);
			mockUser.save.mockResolvedValue({ ...user, deletedAt: new Date() });

			await service.softDelete(userId);
			expect(mockUser.findOne).toHaveBeenCalledWith({ where: { id: userId } });
			expect(mockUser.save).toHaveBeenCalledWith({ ...user, deletedAt: expect.any(Date) });
		});

		it('должен выдать UserNotFoundException, если пользователь не существует', async () => {
			const userId = 1;
			mockUser.findOne.mockResolvedValue(null);

			await expect(service.softDelete(userId)).rejects.toThrow(UserNotFoundException);
		});
	});

	describe('getAll', () => {
		it('должен возвращать список пользователей с нумерацией страниц', async () => {
			const filterDto: FilterUsersDto = {
				limit: 10,
				skip: 0,
				firstname: undefined,
				lastname: undefined,
				patronymic: undefined,
			};

			const users = [
				{ id: 1, firstname: 'John', lastname: 'Doe', email: 'john.doe@example.com' },
				{ id: 2, firstname: 'Jane', lastname: 'Doe', email: 'jane.doe@example.com' },
			];

			mockUser.createQueryBuilder.mockReturnValue({
				skip: jest.fn().mockReturnThis(),
				take: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getManyAndCount: jest.fn().mockResolvedValue([users, users.length]),
			});

			const result = await service.getAll(filterDto);

			expect(result.items).toEqual(users);
			expect(result.paginationInfo).toBeDefined();
			expect(result.paginationInfo.totalItems).toBe(users.length);
			expect(result.paginationInfo.totalPages).toBe(1);
			expect(result.paginationInfo.page).toBe(1);
			expect(result.paginationInfo.perPage).toBe(users.length);
			expect(result.paginationInfo.hasNextPage).toBe(false);
			expect(result.paginationInfo.hasPreviousPage).toBe(false);
		});

		it('должен возвращать пустой список, если ни один пользователь не соответствует фильтрам', async () => {
			const filterDto: FilterUsersDto = {
				limit: 10,
				skip: 0,
				firstname: 'Nonexistent',
				lastname: undefined,
				patronymic: undefined,
			};

			mockUser.createQueryBuilder.mockReturnValue({
				skip: jest.fn().mockReturnThis(),
				take: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
			});

			const result = await service.getAll(filterDto);

			expect(result.items).toEqual([]);
			expect(result.paginationInfo).toBeDefined();
			expect(result.paginationInfo.totalItems).toBe(0);
			expect(result.paginationInfo.totalPages).toBe(0);
			expect(result.paginationInfo.page).toBe(0);
			expect(result.paginationInfo.perPage).toBe(0);
			expect(result.paginationInfo.hasNextPage).toBe(false);
			expect(result.paginationInfo.hasPreviousPage).toBe(false);
		});
	});
});
