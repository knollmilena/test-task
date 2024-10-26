import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsNumber } from 'class-validator';

export class PaginationDto {
	@ApiProperty({ description: 'Количество элементов на одной странице', required: false })
	@IsOptional()
	@IsNumber()
	@Transform(({ value }) => parseInt(value, 10))
	limit?: number;

	@ApiProperty({ description: 'Количество пропускаемых страниц', required: false })
	@IsOptional()
	@IsNumber()
	@Transform(({ value }) => parseInt(value, 10))
	skip?: number;
}
