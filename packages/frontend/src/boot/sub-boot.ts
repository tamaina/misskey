/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createApp, defineAsyncComponent } from 'vue';
import { common } from './common.js';
import type { InternationalizationBoot } from './common.js';
import { emojiPicker } from '@/utility/emoji-picker.js';
import UiMinimum from '@/ui/minimum.vue';

export async function subBoot(i18nBoot: InternationalizationBoot) {
	const { isClientUpdated } = await common(async () => createApp(UiMinimum), i18nBoot);

	emojiPicker.init();
}
