/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { markRaw, shallowRef } from 'vue';
import { createInternationalization } from 'virtual:vite-vue-internationalization';
import { lang } from '@@/js/config.js';
import { I18n } from '@@/js/i18n.js';
import { locale } from '@@/js/locale.js';
import type { Locale } from 'i18n';

export const i18n = markRaw(new I18n<Locale>(locale, _DEV_));
export const internationalization = markRaw(createInternationalization({
	initialLocale: lang,
	fallbackLocale: 'ja-JP',
}));
export const i18nReady = internationalization.ready;
export const $locale = shallowRef({ env: locale });
export const $l = shallowRef({
	get env() {
		return i18n.tsx;
	},
});

// test 以外では使わないこと。インライン化されてるのでだいたい意味がない
export function updateI18n(newLocale: Locale) {
	i18n.locale = newLocale;
	$locale.value = { env: newLocale };
}
