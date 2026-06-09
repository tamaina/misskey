/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// https://vitejs.dev/config/build-options.html#build-modulepreload
import 'vite/modulepreload-polyfill';

import { markRaw } from 'vue';
import { createInternationalization, setActiveInternationalization } from 'virtual:vite-vue-internationalization';
import { lang } from '@@/js/config.js';

if (import.meta.env.DEV) {
	await import('@tabler/icons-webfont/dist/tabler-icons.scss');
} else {
	await import('icons-subsetter/built/tabler-icons-frontend.css');
}

import '@/style.scss';

const internationalization = markRaw(createInternationalization({
	initialLocale: lang,
	fallbackLocale: 'ja-JP',
}));
setActiveInternationalization(internationalization);
const i18nReady = internationalization.ready.then(() => internationalization.loadLocale('ja-JP'));

const internationalizationBoot = {
	internationalization,
	i18nReady,
};

const subBootPaths = ['/share', '/auth', '/miauth', '/oauth', '/signup-complete', '/verify-email', '/install-extensions'];

if (subBootPaths.some(i => window.location.pathname === i || window.location.pathname.startsWith(i + '/'))) {
	const { subBoot } = await import('@/boot/sub-boot.js');
	subBoot(internationalizationBoot);
} else {
	const { mainBoot } = await import('@/boot/main-boot.js');
	mainBoot(internationalizationBoot);
}
