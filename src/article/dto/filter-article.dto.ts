import { IsOptional, IsNumber, IsDate, IsString } from 'class-validator';
import { PaginationDto } from '../../common/types/pagination-info.dto';
import { ApiProperty } from '@nestjs/swagger';

export class FilterArticlesDto extends PaginationDto {
	@IsOptional()
	@IsDate()
	startDate: Date;

	@IsOptional()
	@IsDate()
	endDate: Date;

	@IsOptional()
	@IsNumber()
	authorId: number;

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
