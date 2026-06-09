/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import shader from './mirror.glsl';
import type { ImageEffectorUiDefinition } from '../image-effector/ImageEffector.js';
import { defineImageCompositorFunction } from '@/lib/ImageCompositor.js';
import { useLocale, useLocalizer } from 'virtual:vite-vue-internationalization';

const $locale = useLocale(import.meta.url);
const $l = useLocalizer(import.meta.url);

export const fn = defineImageCompositorFunction<{
	h: number;
	v: number;
}>({
	shader,
	main: ({ gl, u, params }) => {
		gl.uniform1i(u.h, params.h);
		gl.uniform1i(u.v, params.v);
	},
});

export const uiDefinition = {
	name: $locale.value.env._imageEffector._fxs.mirror,
	params: {
		h: {
			label: $locale.value.env.horizontal,
			type: 'number:enum',
			enum: [
				{ value: -1 as const, icon: 'ti ti-arrow-bar-right' },
				{ value: 0 as const, icon: 'ti ti-minus-vertical' },
				{ value: 1 as const, icon: 'ti ti-arrow-bar-left' },
			],
			default: -1,
		},
		v: {
			label: $locale.value.env.vertical,
			type: 'number:enum',
			enum: [
				{ value: -1 as const, icon: 'ti ti-arrow-bar-down' },
				{ value: 0 as const, icon: 'ti ti-minus' },
				{ value: 1 as const, icon: 'ti ti-arrow-bar-up' },
			],
			default: 0,
		},
	},
} satisfies ImageEffectorUiDefinition<typeof fn>;
