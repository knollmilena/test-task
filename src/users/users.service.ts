import { Injectable, BadRequestException } from '@nestjs/common';
import * as argon from 'argon2';
import { UserNotFoundException } from './exceptions/user-not-found.exceptions';
import { UserDoubleException } from './exceptions/user-double.exceptions';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { GetUserParams } from './types/get-user-params.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterUsersDto } from './dto/filter-users.dto';
import { getPaginationInfo } from '../common/utils/get-pagination-info';
import { PaginationInfo } from '../common/types/pagination-info.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>,
	) {}

	async getAll({
		limit = 100,
		skip = 0,
		firstname,
		lastname,
		patronymic,
	}: FilterUsersDto): Promise<{ items: UserEntity[]; paginationInfo: PaginationInfo }> {
		const query = await this.usersRepository.createQueryBuilder('users');

		if (firstname || lastname || patronymic) {
			const users = await this.usersRepository.find({
				where: [
					firstname ? { firstname: ILike(`%${firstname}%`) } : {},
					lastname ? { lastname: ILike(`%${lastname}%`) } : {},
					patronymic ? { patronymic: ILike(`%${patronymic}%`) } : {},
				].filter(Boolean),
			});

			if (users?.length > 0) {
				const userIds = users.map((user) => user.id);
				query.andWhere('users.id IN (:...userIds)', { userIds });
			} else {
				return { items: [], paginationInfo: getPaginationInfo([], 0, limit, skip) };
			}
		}

		const [items, count] = await query
			.skip(skip * limit)
			.take(limit)
			.orderBy('users.createdAt', 'ASC', 'NULLS LAST')
			.getManyAndCount();

		const paginationInfo = getPaginationInfo(items, count, limit, skip);
		return { items, paginationInfo };
	}

	async getOneByParams(params: GetUserParams): Promise<UserEntity> {
		const { id, email } = params;

		const user = await this.usersRepository.findOne({
			where: id ? { id } : { email },
		});

		if (!user) {
			throw new UserNotFoundException();
		}

		return user;
	}

	async create(dto: CreateUserDto): Promise<UserEntity> {
		const user = await this.usersRepository.findOne({
			where: { email: dto.email },
		});

		if (user) {
			throw new UserDoubleException();
		}

		let newUser = await this.usersRepository.create({
			firstname: dto.firstname,
			lastname: dto.lastname,
			patronymic: dto.patronymic,
			email: dto.email,
			password: await argon.hash(dto.password, { hashLength: 60 }),
		});

		try {
			newUser = await this.usersRepository.save(newUser);
		} catch (error) {
			throw new BadRequestException(`Не удалось создать пользователя, ${dto.email}`);
		}

		delete newUser.password;

		return newUser;
	}

	async update(dto: UpdateUserDto) {
		const user = await this.getOneByParams({ id: dto.id });

		Object.assign(user, dto);

		await this.usersRepository.save(user);
	}

	async delete(id: number) {
		await this.getOneByParams({ id });
		return this.usersRepository.delete({ id });
	}

	async softDelete(id: number) {
		const user = await this.getOneByParams({ id });
		user.deletedAt = new Date();
		await this.usersRepository.save(user);
	}

	async hashPassword(password: string): Promise<string> {
		const hashedPassword = await argon.hash(password, { hashLength: 60 });
		return hashedPassword;
	}
}
