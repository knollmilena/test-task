import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/types/pagination-info.dto';
import { ApiProperty } from '@nestjs/swagger';

export class FilterUsersDto extends PaginationDto {
	@ApiProperty({ description: 'Имя', required: false })
	@IsOptional()
	@IsString()
	firstname: string;

	@ApiProperty({ description: 'Фамилия', required: false })
	@IsOptional()
	@IsString()
	lastname: string;

	@ApiProperty({ description: 'Отчество', required: false })
	@IsOptional()
	@IsString()
	patronymic: string;
}
