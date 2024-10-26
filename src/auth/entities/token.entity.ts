import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CustomBaseEntity } from '../../common/entities/custom-base.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity(`token`)
export class TokenEntity extends CustomBaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	token: string;

	@Column()
	exp: number;

	@ManyToOne(() => UserEntity, (user) => user.tokens)
	user: UserEntity;
}
