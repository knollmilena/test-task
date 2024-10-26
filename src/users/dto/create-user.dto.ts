import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	firstname: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	lastname: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	patronymic?: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	@MinLength(8)
	password: string;
}
