import { markRaw } from 'vue';
import { Storage } from '../../pizzax';
import { avInfo } from './types';

export const store = markRaw(new Storage('audio-visual', {
	playing: {
		where: 'account',
		default: null as null | {
			seek: number; // seconds
			data: avInfo;
		},
	},
	history: {
		where: 'account',
		default: [] as avInfo[],
	},
	queue: {
		where: 'account',
		default: [] as avInfo[],
	},
}));
