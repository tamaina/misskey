/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { readonly, ref } from 'vue';
import * as os from '@/os.js';
import { store } from '@/store.js';
import { useLocale, useLocalizer } from 'virtual:vite-vue-internationalization';

const $locale = useLocale(import.meta.url);
const $l = useLocalizer(import.meta.url);

export const storagePersistenceSupported = window.isSecureContext && 'storage' in navigator;
const storagePersisted = ref(false);

export async function getStoragePersistenceStatusRef() {
	if (storagePersistenceSupported) {
		storagePersisted.value = await navigator.storage.persisted().catch(() => false);
	}

	return readonly(storagePersisted);
}

export async function enableStoragePersistence() {
	if (!storagePersistenceSupported) return;
	try {
		const persisted = await navigator.storage.persist();
		if (persisted) {
			storagePersisted.value = true;
		} else {
			os.alert({
				type: 'error',
				text: $locale.value.env.somethingHappened,
			});
		}
	}	catch (err) {
		os.alert({
			type: 'error',
			text: $locale.value.env.somethingHappened,
		});
	}
}

export function skipStoragePersistence() {
	store.set('showStoragePersistenceSuggestion', false);
}
