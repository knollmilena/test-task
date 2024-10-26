import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Length } from 'class-validator';

export class UpdateArticleDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	id: number;

	@ApiProperty()
	@IsOptional()
	@IsString({ message: 'Заголовок должен быть строкой' })
	@Length(5, 120, { message: 'Заголовок должен содержать от 5 до 120 символов' })
	title: string;

	@ApiProperty()
	@IsString({ message: 'Содержимое статьи должно быть строкой' })
	@Length(300, 3000, { message: 'Статья должна содержать от 300 до 3000 символов' })
	description: string;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	authorId: number;
}
