import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CustomBaseEntity } from '../../common/entities/custom-base.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity(`articles`)
export class ArticleEntity extends CustomBaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column()
	description: string;

	@ManyToOne(() => UserEntity, (author) => author.articles)
	author: UserEntity;
}
