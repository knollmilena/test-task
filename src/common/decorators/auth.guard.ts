import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ACCESS_DENIED_ERROR, LOGIN_REQUIRED_ERROR } from '../messages/error-messages';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private configService: ConfigService,
	) {}

	canActivate(context: ExecutionContext): boolean {
		const request: Request = context.switchToHttp().getRequest();
		const token = request.cookies[this.configService.get('COOKIE_KEY_NAME')];

		if (!token) {
			throw new UnauthorizedException(LOGIN_REQUIRED_ERROR);
		}

		try {
			this.jwtService.verify(token);
			return true;
		} catch (error) {
			throw new UnauthorizedException(ACCESS_DENIED_ERROR);
		}
	}
}
