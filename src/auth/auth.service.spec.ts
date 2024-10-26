import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from './exceptions/unauthorized.exception';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserEntity } from '../users/entities/user.entity';
import { Response } from 'express';
import * as argon from 'argon2';
import { ACCESS_DENIED_ERROR, ALREADY_LOGGED_OUT_ERROR } from '../common/messages/error-messages';
import { LOGOUT_MESSAGE } from '../common/messages/successfull.messages';

describe('AuthService', () => {
	let authService: AuthService;

	const mockUserService = {
		create: jest.fn(),
		getOneByParams: jest.fn(),
	};

	const mockTokenRepository = {
		save: jest.fn(),
		findOne: jest.fn(),
		delete: jest.fn(),
	};

	const mockJwtService = {
		sign: jest.fn(),
	};

	const mockConfigService = {
		get: jest.fn((key: string) => {
			if (key === 'COOKIE_KEY_NAME') return 'jwt';
			if (key === 'JWT_EXPIRES') return '3600';
			return null;
		}),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{ provide: UserService, useValue: mockUserService },
				{ provide: JwtService, useValue: mockJwtService },
				{ provide: ConfigService, useValue: mockConfigService },
				{ provide: 'TokenEntityRepository', useValue: mockTokenRepository },
			],
		}).compile();

		authService = module.get<AuthService>(AuthService);
	});

	describe('register', () => {
		it('должен зарегистрировать нового пользователя', async () => {
			const registerDto: RegisterDto = {
				firstname: 'Jane',
				lastname: 'Doe',
				email: 'jane.doe@example.com',
				password: 'password123',
			};
			const user = new UserEntity();
			mockUserService.create.mockResolvedValue(user);

			expect(await authService.register(registerDto)).toEqual(user);
			expect(mockUserService.create).toHaveBeenCalledWith(registerDto);
		});
	});

	describe('login', () => {
		it('должен войти в систему пользователя и вернуть ответ', async () => {
			const loginDto: LoginDto = {
				email: 'jane.doe@example.com',
				password: 'password123',
			};
			const response = { cookie: jest.fn(), json: jest.fn() } as unknown as Response;
			const user = new UserEntity();
			user.password = await argon.hash(loginDto.password);
			mockUserService.getOneByParams.mockResolvedValue(user);
			jest.spyOn(argon, 'verify').mockResolvedValue(true);
			mockJwtService.sign.mockReturnValue('jwt_token');
			mockTokenRepository.save.mockResolvedValue({});

			await authService.login(loginDto, response);

			expect(response.cookie).toHaveBeenCalledWith('jwt', 'jwt_token', expect.any(Object));
			expect(response.json).toHaveBeenCalledWith({ message: 'Успешный вход' });
		});

		it('должен выдать UnauthorizedException для неверных учетных данных', async () => {
			const loginDto: LoginDto = {
				email: 'jane.doe@example.com',
				password: 'wrong_password',
			};
			const response = { cookie: jest.fn(), json: jest.fn() } as unknown as Response;
			const user = new UserEntity();
			user.password = await argon.hash('password123');
			mockUserService.getOneByParams.mockResolvedValue(user);
			jest.spyOn(argon, 'verify').mockResolvedValue(false);

			await expect(authService.login(loginDto, response)).rejects.toThrow(UnauthorizedException);
		});
	});

	describe('logout', () => {
		it('должен успешно выйти из системы пользователя', async () => {
			const request = { cookies: { jwt: 'jwt_token' } } as any;
			const response = { json: jest.fn(), clearCookie: jest.fn() } as unknown as Response;
			const tokenEntity = { id: 1, token: 'jwt_token' };
			mockTokenRepository.findOne.mockResolvedValue(tokenEntity);

			await authService.logout(request, response);

			expect(mockTokenRepository.delete).toHaveBeenCalledWith({ id: tokenEntity.id });
			expect(response.clearCookie).toHaveBeenCalledWith('jwt');
			expect(response.json).toHaveBeenCalledWith({ message: LOGOUT_MESSAGE });
		});

		it('должен возвращать сообщение об уже выходе из системы, если токен не найден', async () => {
			const request = { cookies: {} } as any;
			const response = { json: jest.fn() } as unknown as Response;

			await authService.logout(request, response);

			expect(response.json).toHaveBeenCalledWith({ message: ALREADY_LOGGED_OUT_ERROR });
		});

		it('должен вернуть отказ в доступе, если токен недействителен', async () => {
			const request = { cookies: { jwt: 'invalid_token' } } as any;
			const response = { json: jest.fn() } as unknown as Response;
			mockTokenRepository.findOne.mockResolvedValue(null);

			await authService.logout(request, response);

			expect(response.json).toHaveBeenCalledWith({ message: ACCESS_DENIED_ERROR });
		});
	});
});
