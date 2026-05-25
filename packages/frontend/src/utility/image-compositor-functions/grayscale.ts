/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import shader from './grayscale.glsl';
import type { ImageEffectorUiDefinition } from '../image-effector/ImageEffector.js';
import { defineImageCompositorFunction } from '@/lib/ImageCompositor.js';
import { $locale, $l } from '@/i18n.js';

export const fn = defineImageCompositorFunction({
	shader,
	main: ({ gl, u, params }) => {
	},
});

export const uiDefinition = {
	name: $locale.value.env._imageEffector._fxs.grayscale,
	params: {
	},
} satisfies ImageEffectorUiDefinition<typeof fn>;
