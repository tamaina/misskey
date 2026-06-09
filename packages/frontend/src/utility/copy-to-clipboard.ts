/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as os from '@/os.js';
import { useLocale, useLocalizer } from 'virtual:vite-vue-internationalization';

const $locale = useLocale(import.meta.url);
const $l = useLocalizer(import.meta.url);

/**
 * Clipboardに値をコピー(TODO: 文字列以外も対応)
 */
export function copyToClipboard(input: string | null) {
	if (input) {
		navigator.clipboard.writeText(input);
		os.toast($locale.value.env.copiedToClipboard);
	}
};
