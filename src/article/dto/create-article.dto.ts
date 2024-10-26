import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Length } from 'class-validator';

export class CreateArticleDto {
	@ApiProperty()
	@IsNotEmpty({ message: 'Заголовок не может быть пустым' })
	@IsString({ message: 'Заголовок должен быть строкой' })
	@Length(5, 120, { message: 'Заголовок должен содержать от 5 до 120 символов' })
	title: string;

	@ApiProperty()
	@IsNotEmpty({ message: 'Статья не может быть пустой' })
	@IsString({ message: 'Содержимое статьи должно быть строкой' })
	@Length(300, 3000, { message: 'Статья должна содержать от 300 до 3000 символов' })
	description: string;

	@ApiProperty()
	@IsNotEmpty({ message: 'Автор не может быть пустым' })
	@IsNumber({}, { message: 'Автор должен быть числом' })
	authorId: number;
}
