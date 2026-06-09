/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	cleanup,
	render as renderWithTestingLibrary,
	type RenderResult,
} from '@testing-library/vue';
import { useLocale, useLocalizer } from 'virtual:vite-vue-internationalization';

type RenderOptions = Parameters<typeof renderWithTestingLibrary>[1];

export { cleanup, type RenderResult };

const $locale = useLocale(import.meta.url);
const $l = useLocalizer(import.meta.url);

export const render: typeof renderWithTestingLibrary = (component, options) => {
	const global = options?.global ?? {};

	return renderWithTestingLibrary(component, {
		...options,
		global: {
			...global,
			mocks: {
				$locale: $locale.value,
				$l: $l.value,
				...global.mocks,
			},
		},
	} as RenderOptions);
};
