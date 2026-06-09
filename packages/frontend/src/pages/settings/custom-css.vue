<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<FormInfo warn>{{ $locale.env.customCssWarn }}</FormInfo>

	<FormInfo v-if="isSafeMode" warn>{{ $locale.env.customCssIsDisabledBecauseSafeMode }}</FormInfo>

	<MkCodeEditor v-model="localCustomCss" manualSave lang="css">
		<template #label>CSS</template>
	</MkCodeEditor>
</div>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { ref, watch, computed } from 'vue';
import { isSafeMode } from '@@/js/config.js';
import MkCodeEditor from '@/components/MkCodeEditor.vue';
import FormInfo from '@/components/MkInfo.vue';
import * as os from '@/os.js';
import { unisonReload } from '@/utility/unison-reload.js';
import { definePage } from '@/page.js';
import { miLocalStorage } from '@/local-storage.js';
const localeRef = useLocale(import.meta.url);

const localCustomCss = ref(miLocalStorage.getItem('customCss') ?? '');

async function apply() {
	miLocalStorage.setItem('customCss', localCustomCss.value);

	const { canceled } = await os.confirm({
		type: 'info',
		text: localeRef.value.env.reloadToApplySetting,
	});
	if (canceled) return;

	unisonReload();
}

watch(localCustomCss, async () => {
	await apply();
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env.customCss,
	icon: 'ti ti-code',
}));
</script>
