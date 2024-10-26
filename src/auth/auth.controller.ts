import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Request, Response } from 'express';
import { UserEntity } from '../users/entities/user.entity';

@ApiTags('Регистрация и авторизация')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@ApiOperation({ summary: 'регистрация' })
	@Post('registration')
	async register(@Body() dto: RegisterDto): Promise<UserEntity> {
		return await this.authService.register(dto);
	}

	@ApiOperation({ summary: 'авторизация' })
	@Post('login')
	async login(@Body() dto: LoginDto, @Res() response: Response): Promise<Response> {
		return await this.authService.login(dto, response);
	}

	@ApiOperation({ summary: 'выход из аккаунта' })
	@Post('logout')
	async logout(@Req() request: Request, @Res() response: Response): Promise<Response> {
		return await this.authService.logout(request, response);
	}
}
