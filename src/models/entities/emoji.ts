import { PrimaryColumn, Entity, Index, Column } from 'typeorm';
import { id } from '../id';

@Entity()
@Index(['name', 'host'], { unique: true })
export class Emoji {
	@PrimaryColumn(id())
	public id: string;

	@Column('timestamp with time zone', {
		nullable: true
	})
	public updatedAt: Date | null;

	@Index()
	@Column('varchar', {
		length: 128
	})
	public name: string;

	@Index()
	@Column('varchar', {
		length: 128, nullable: true
	})
	public host: string | null;

	@Column('varchar', {
		length: 256,
	})
	public url: string;

	@Column('varchar', {
		length: 256, nullable: true
	})
	public uri: string | null;

	@Column('varchar', {
		length: 64, nullable: true
	})
	public type: string | null;

	@Column('varchar', {
		array: true, length: 128,
	})
	public aliases: string[];
}
