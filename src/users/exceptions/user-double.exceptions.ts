import { ConflictException } from '@nestjs/common';
import { USER_DOUBLE_ERROR } from '../../common/messages/error-messages';

export class UserDoubleException extends ConflictException {
	constructor() {
		super(USER_DOUBLE_ERROR);
	}
}
