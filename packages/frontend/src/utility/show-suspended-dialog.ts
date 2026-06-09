/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as os from '@/os.js';
import { useLocale, useLocalizer } from 'virtual:vite-vue-internationalization';

const $locale = useLocale(import.meta.url);
const $l = useLocalizer(import.meta.url);

export function showSuspendedDialog() {
	return os.alert({
		type: 'error',
		title: $locale.value.env.yourAccountSuspendedTitle,
		text: $locale.value.env.yourAccountSuspendedDescription,
	});
}
