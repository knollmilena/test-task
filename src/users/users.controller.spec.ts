import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { PaginationInfo } from '../common/types/pagination-info.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { JwtCoreModule } from '../auth/jwt.module';

describe('User  Controller', () => {
	let userController: UserController;

	const mockUserService = {
		getAll: jest.fn(),
		getOneByParams: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		softDelete: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [JwtCoreModule],
			controllers: [UserController],
			providers: [
				{
					provide: UserService,
					useValue: mockUserService,
				},
			],
		}).compile();

		userController = module.get<UserController>(UserController);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getAll', () => {
		it('должен вернуть всех пользователей', async () => {
			const filterDto: FilterUsersDto = {
				skip: 0,
				limit: 10,
				firstname: undefined,
				lastname: undefined,
				patronymic: undefined,
			};
			const users = [
				{
					id: 1,
					firstname: 'John',
					lastname: 'Doe',
					email: 'john.doe@example.com',
					password: 'password123',
				},
			];
			const paginationInfo: PaginationInfo = {
				totalItems: 1,
				totalPages: 1,
				page: 1,
				perPage: 10,
				hasNextPage: false,
				hasPreviousPage: false,
			};
			mockUserService.getAll.mockResolvedValue({ items: users, paginationInfo });

			const result = await userController.getAll(filterDto);
			expect(result).toEqual({ items: users, paginationInfo });
			expect(mockUserService.getAll).toHaveBeenCalledWith(filterDto);
		});
	});

	describe('getOne', () => {
		it('должен вернуть пользователя по id', async () => {
			const userId = 1;
			const user = {
				id: userId,
				firstname: 'John',
				lastname: 'Doe',
				email: 'john.doe@example.com',
				password: 'password123',
			};

			mockUserService.getOneByParams.mockResolvedValue(user);

			const result = await userController.getOne(userId);
			expect(result).toEqual(user);
			expect(mockUserService.getOneByParams).toHaveBeenCalledWith({ id: userId, email: undefined });
		});

		it('должен вернуть пользователя по email', async () => {
			const userEmail = 'john.doe@example.com';
			const user = {
				id: 1,
				firstname: 'John',
				lastname: 'Doe',
				email: userEmail,
				password: 'password123',
			};

			mockUserService.getOneByParams.mockResolvedValue(user);

			const result = await userController.getOne(undefined, userEmail);
			expect(result).toEqual(user);
			expect(mockUserService.getOneByParams).toHaveBeenCalledWith({
				id: undefined,
				email: userEmail,
			});
		});
	});

	describe('create', () => {
		it('должен создать пользователя', async () => {
			const createUserDto: CreateUserDto = {
				firstname: 'John',
				lastname: 'Doe',
				email: 'john.doe@example.com',
				password: 'password123',
			};
			const user = { id: 1, ...createUserDto };

			mockUserService.create.mockResolvedValue(user);

			const result = await userController.create(createUserDto);
			expect(result).toEqual(user);
			expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
		});
	});

	describe('update', () => {
		it('должен обновить данные пользователя', async () => {
			const updateUserDto: UpdateUserDto = {
				id: 1,
				firstname: 'John',
				lastname: 'Doe',
				email: 'john.doe@example.com',
				password: 'newpassword123',
			};

			const existingUser = {
				id: 1,
				firstname: 'Jane',
				lastname: 'Doe',
				email: 'jane.doe@example.com',
				password: 'oldpassword',
			};
			const updatedUser = { id: 1, ...updateUserDto };

			jest.spyOn(userController, 'getOne').mockResolvedValue(existingUser as UserEntity);
			mockUserService.update.mockResolvedValue(updatedUser);

			const result = await userController.update(updateUserDto);
			expect(result).toEqual(updatedUser);
			expect(mockUserService.update).toHaveBeenCalledWith(updateUserDto);
		});

		it('должен выбросить ошибку, если пользователь не найден', async () => {
			const updateUserDto: UpdateUserDto = {
				id: 1,
				firstname: 'John',
				lastname: 'Doe',
				email: 'joh.doe@example.com',
				password: 'newpassword123',
			};

			jest
				.spyOn(userController, 'getOne')
				.mockRejectedValue(new NotFoundException('Пользователь не найден'));

			await expect(userController.update(updateUserDto)).rejects.toThrow(NotFoundException);
			expect(mockUserService.update).not.toHaveBeenCalled();
		});
	});

	describe('delete', () => {
		it('должен удалить пользователя по id', async () => {
			const userId = 1;

			mockUserService.softDelete.mockResolvedValue({ success: true });

			const result = await userController.delete(userId);
			expect(result).toEqual({ success: true });
			expect(mockUserService.softDelete).toHaveBeenCalledWith(userId);
		});
	});
});
