import { EntityRepository, Repository } from 'typeorm';
import { Antenna } from '../entities/antenna';
import { ensure } from '../../prelude/ensure';
import { SchemaType } from '../../misc/schema';

export type PackedAntenna = SchemaType<typeof packedAntennaSchema>;

@EntityRepository(Antenna)
export class AntennaRepository extends Repository<Antenna> {
	public async pack(
		src: Antenna['id'] | Antenna,
	): Promise<PackedAntenna> {
		const antenna = typeof src === 'object' ? src : await this.findOne(src).then(ensure);

		return {
			id: antenna.id,
			createdAt: antenna.createdAt.toISOString(),
			name: antenna.name,
		};
	}
}

export const packedAntennaSchema = {
	type: 'object' as const,
	optional: false as const, nullable: false as const,
	properties: {
		id: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
			format: 'id',
			description: 'The unique identifier for this Antenna.',
			example: 'xxxxxxxxxx',
		},
		createdAt: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
			format: 'date-time',
			description: 'The date that the Antenna was created.'
		},
		name: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
			description: 'The name of the Antenna.'
		},
	},
};