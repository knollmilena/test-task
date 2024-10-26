import { UnauthorizedException as NestUnauthorizedException } from '@nestjs/common';
import { LOGGIN_ERROR } from '../../common/messages/error-messages';

export class UnauthorizedException extends NestUnauthorizedException {
	constructor() {
		super(LOGGIN_ERROR);
	}
}
