import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
	@ApiProperty()
	@IsNumber()
	@IsNotEmpty()
	id: number;

	@ApiProperty()
	@IsOptional()
	@IsString()
	firstname: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	lastname: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	patronymic?: string;

	@ApiProperty()
	@IsOptional()
	@IsEmail()
	email: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	@MinLength(8)
	password: string;
}
