/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { markRaw } from 'vue';
import { createInternationalization, setActiveInternationalization, useLocale, useLocalizer } from 'virtual:vite-vue-internationalization';
import { lang } from '@@/js/config.js';
import type { Locale } from 'i18n';

export const internationalization = markRaw(createInternationalization({
	initialLocale: lang,
	fallbackLocale: 'ja-JP',
}));
setActiveInternationalization(internationalization);
export const i18nReady = internationalization.ready.then(() => internationalization.loadLocale('ja-JP'));
export const $locale = useLocale(import.meta.url);
export const $l = useLocalizer(import.meta.url);

export const i18n = {
	get ts(): Locale {
		return $locale.value.env as Locale;
	},
	get env() {
		return $locale.value.env as Locale;
	},
	get tsx() {
		return $l.value.env;
	},
};

// test 以外では使わないこと。インライン化されてるのでだいたい意味がない
export function updateI18n(_newLocale: Locale) {
}
