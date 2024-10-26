import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserEntity } from '../users/entities/user.entity';
import { Request, Response } from 'express';

describe('AuthController', () => {
	let authController: AuthController;

	const mockAuthService = {
		register: jest.fn(),
		login: jest.fn(),
		logout: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [{ provide: AuthService, useValue: mockAuthService }],
		}).compile();

		authController = module.get<AuthController>(AuthController);
	});

	describe('register', () => {
		it('должен зарегистрировать нового пользователя', async () => {
			const registerDto: RegisterDto = {
				firstname: 'John',
				lastname: 'Doe',
				email: 'john.doe@example.com',
				password: 'password123',
			};
			const result: UserEntity = { id: 1, ...registerDto } as UserEntity;
			mockAuthService.register.mockResolvedValue(result);

			expect(await authController.register(registerDto)).toEqual(result);
			expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
		});
	});

	describe('login', () => {
		it('должен войти в систему пользователя и вернуть ответ', async () => {
			const loginDto: LoginDto = {
				email: 'john.doe@example.com',
				password: 'password123',
			};
			const response = {} as Response;
			mockAuthService.login.mockResolvedValue(response);

			expect(await authController.login(loginDto, response)).toEqual(response);
			expect(mockAuthService.login).toHaveBeenCalledWith(loginDto, response);
		});
	});

	describe('logout', () => {
		it('должен выйти из системы и вернуть ответ', async () => {
			const request = {} as Request;
			const response = {} as Response;
			mockAuthService.logout.mockResolvedValue(response);

			expect(await authController.logout(request, response)).toEqual(response);
			expect(mockAuthService.logout).toHaveBeenCalledWith(request, response);
		});
	});
});
