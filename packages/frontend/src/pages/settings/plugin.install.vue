<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<FormInfo warn>{{ $locale.env._plugin.installWarn }}</FormInfo>

	<MkCodeEditor v-model="code" lang="is">
		<template #label>{{ $locale.env.code }}</template>
	</MkCodeEditor>

	<div>
		<MkButton :disabled="code == null || code.trim() === ''" primary inline @click="install"><i class="ti ti-check"></i> {{ $locale.env.install }}</MkButton>
	</div>
</div>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { nextTick, ref, computed } from 'vue';
import MkCodeEditor from '@/components/MkCodeEditor.vue';
import MkButton from '@/components/MkButton.vue';
import FormInfo from '@/components/MkInfo.vue';
import * as os from '@/os.js';
import { definePage } from '@/page.js';
import { installPlugin } from '@/plugin.js';
import { useRouter } from '@/router.js';
const localeRef = useLocale(import.meta.url);

const router = useRouter();
const code = ref<string | null>(null);

async function install() {
	if (!code.value) return;

	try {
		await installPlugin(code.value);
		os.success();
		code.value = null;

		router.push('/settings/plugin');
	} catch (err: any) {
		os.alert({
			type: 'error',
			title: 'Install failed',
			text: err.toString() ?? null,
		});
	}
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env._plugin.install,
	icon: 'ti ti-download',
}));
</script>
