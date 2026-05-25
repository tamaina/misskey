/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as os from '@/os.js';
import { $locale, $l } from '@/i18n.js';

export function showSuspendedDialog() {
	return os.alert({
		type: 'error',
		title: $locale.value.env.yourAccountSuspendedTitle,
		text: $locale.value.env.yourAccountSuspendedDescription,
	});
}
