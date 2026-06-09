/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { MkSelectItem } from '@/components/MkSelect.vue';
import { useLocale, useLocalizer } from 'virtual:vite-vue-internationalization';

const $locale = useLocale(import.meta.url);
const $l = useLocalizer(import.meta.url);

export function getPageBlockList() {
	return [
		{ value: 'section', label: $locale.value.env._pages.blocks.section },
		{ value: 'text', label: $locale.value.env._pages.blocks.text },
		{ value: 'image', label: $locale.value.env._pages.blocks.image },
		{ value: 'note', label: $locale.value.env._pages.blocks.note },
	] as const satisfies MkSelectItem[];
}
