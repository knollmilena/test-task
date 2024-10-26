import { Controller, Get, Delete, Query, Body, Post, Put } from '@nestjs/common';
import { UserService } from './users.service';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginationInfo } from '../common/types/pagination-info.interface';
import { FilterUsersDto } from './dto/filter-users.dto';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Пользователи')
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiOperation({ summary: 'получить всех пользователей' })
	@ApiQuery({ name: 'skip', required: false, type: Number })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	@ApiQuery({ name: 'firstname', required: false, type: String })
	@ApiQuery({ name: 'lastname', required: false, type: String })
	@ApiQuery({ name: 'patronymic', required: false, type: Number })
	@Get('all')
	async getAll(
		@Query() dto: FilterUsersDto,
	): Promise<{ items: UserEntity[]; paginationInfo: PaginationInfo }> {
		return await this.userService.getAll(dto);
	}

	@ApiOperation({ summary: 'найти пользователя по id или email' })
	@ApiParam({ name: 'id', description: 'ID полььзователя' })
	@Get()
	async getOne(@Query('id') id?: number, @Query('email') email?: string) {
		return this.userService.getOneByParams({ id, email });
	}

	@ApiOperation({ summary: 'создать пользователя' })
	@Post()
	async create(@Body() dto: CreateUserDto) {
		return this.userService.create(dto);
	}

	@ApiOperation({ summary: 'обновить даннные пользователя' })
	@Put()
	async update(@Body() dto: UpdateUserDto) {
		await this.getOne(dto.id);

		return this.userService.update(dto);
	}

	@ApiOperation({ summary: 'удалить пользователя по id' })
	@Delete('delete')
	async delete(@Query('id') id?: number) {
		await this.getOne(id);

		return this.userService.softDelete(id);
	}
}
