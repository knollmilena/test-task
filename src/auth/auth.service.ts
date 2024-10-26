import { Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserEntity } from '../users/entities/user.entity';
import { TokenEntity } from './entities/token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from './exceptions/unauthorized.exception';
import { Request, Response } from 'express';
import { ACCESS_DENIED_ERROR, ALREADY_LOGGED_OUT_ERROR } from '../common/messages/error-messages';
import { LOGOUT_MESSAGE } from '../common/messages/successfull.messages';

@Injectable()
export class AuthService {
	private readonly cookieKeyName: string;
	private readonly jwtExp: number;
	private readonly isProduction: boolean;

	constructor(
		@InjectRepository(TokenEntity) private readonly tokenRepository: Repository<TokenEntity>,
		private readonly jwtService: JwtService,
		private readonly userService: UserService,
		private readonly configService: ConfigService,
	) {
		this.cookieKeyName = this.configService.get('COOKIE_KEY_NAME');
		this.jwtExp = Number(this.configService.get('JWT_EXPIRES'));
		this.isProduction = this.configService.get('NODE_ENV') === 'production';
	}

	async register(dto: RegisterDto): Promise<UserEntity> {
		return await this.userService.create(dto);
	}

	async login(dto: LoginDto, response: Response): Promise<Response> {
		const user = await this.userService.getOneByParams({ email: dto.email });

		const isCorrectPassword = await argon.verify(user.password, dto.password);
		if (!user || !isCorrectPassword) {
			throw new UnauthorizedException();
		}

		const token = await this.createToken(user);

		response.cookie(this.cookieKeyName, token, {
			httpOnly: true,
			secure: this.isProduction,
			maxAge: this.jwtExp,
		});

		return response.json({ message: 'Успешный вход' });
	}

	async createToken(user: UserEntity): Promise<string> {
		const payload = { id: user.id, email: user.email };
		const token = this.jwtService.sign(payload);
		await this.tokenRepository.save({
			token,
			exp: this.jwtExp,
			user,
		});

		return token;
	}

	async logout(request: Request, response: Response): Promise<Response> {
		const token = request.cookies[this.cookieKeyName];

		if (!token) {
			return response.json({ message: ALREADY_LOGGED_OUT_ERROR });
		}

		const tokenEntity = await this.tokenRepository.findOne({ where: { token } });

		if (!tokenEntity) {
			return response.json({ message: ACCESS_DENIED_ERROR });
		}

		await this.tokenRepository.delete({ id: tokenEntity.id });
		response.clearCookie('jwt');

		return response.json({ message: LOGOUT_MESSAGE });
	}
}
