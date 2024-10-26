import { NotFoundException } from '@nestjs/common';
import { ARTICLE_NOT_FOUND_EXCEPTION } from '../../common/messages/error-messages';

export class ArticleNotFoundException extends NotFoundException {
	constructor() {
		super(ARTICLE_NOT_FOUND_EXCEPTION);
	}
}
