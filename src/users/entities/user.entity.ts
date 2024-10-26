import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CustomBaseEntity } from '../../common/entities/custom-base.entity';
import { ArticleEntity } from '../../article/entities/article.entity';
import { TokenEntity } from '../../auth/entities/token.entity';

@Entity(`users`)
export class UserEntity extends CustomBaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	firstname: string;

	@Column()
	lastname: string;

	@Column({ nullable: true })
	patronymic: string;

	@Column({ unique: true })
	email: string;

	@Column()
	password: string;

	@OneToMany(() => ArticleEntity, (article) => article.author, { cascade: true })
	articles: ArticleEntity[];

	@OneToMany(() => TokenEntity, (token) => token.user, { cascade: true })
	tokens: TokenEntity[];
}
