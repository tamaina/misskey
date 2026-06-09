/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'misskey-js';
import * as os from '@/os.js';
import { prefer } from '@/preferences.js';
import { useLocale, useLocalizer } from 'virtual:vite-vue-internationalization';

const $locale = useLocale(import.meta.url);
const $l = useLocalizer(import.meta.url);

export function shouldHideFileByDefault(file: Misskey.entities.DriveFile): boolean {
	if (prefer.s.nsfw === 'force' || prefer.s.dataSaver.media) {
		return true;
	}

	if (file.isSensitive && prefer.s.nsfw !== 'ignore') {
		return true;
	}

	return false;
}

export async function canRevealFile(file: Misskey.entities.DriveFile): Promise<boolean> {
	if (file.isSensitive && prefer.s.confirmWhenRevealingSensitiveMedia) {
		const { canceled } = await os.confirm({
			type: 'question',
			text: $locale.value.env.sensitiveMediaRevealConfirm,
		});
		if (canceled) return false;
	}

	return true;
}
