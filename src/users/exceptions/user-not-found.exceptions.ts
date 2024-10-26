import { NotFoundException } from '@nestjs/common';
import { USER_NOT_FOUND_EXCEPTION } from '../../common/messages/error-messages';

export class UserNotFoundException extends NotFoundException {
	constructor() {
		super(USER_NOT_FOUND_EXCEPTION);
	}
}
