<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<MkCodeEditor v-model="installThemeCode" lang="json5">
		<template #label>{{ $locale.env._theme.code }}</template>
	</MkCodeEditor>

	<div class="_buttons">
		<MkButton :disabled="installThemeCode == null || installThemeCode.trim() === ''" inline @click="() => previewTheme(installThemeCode!)"><i class="ti ti-eye"></i> {{ $locale.env.preview }}</MkButton>
		<MkButton :disabled="installThemeCode == null || installThemeCode.trim() === ''" primary inline @click="() => install(installThemeCode!)"><i class="ti ti-check"></i> {{ $locale.env.install }}</MkButton>
	</div>
</div>
</template>

<script lang="ts" setup>
import { $locale as localeRef, $l as localizerRef } from '@/i18n.js';

import { ref, computed } from 'vue';
import MkCodeEditor from '@/components/MkCodeEditor.vue';
import MkButton from '@/components/MkButton.vue';
import { themeManager, installTheme, handleThemeInstallError } from '@/theme.js';
import { parseThemeCode } from '@@/js/theme.js';
import * as os from '@/os.js';
import { definePage } from '@/page.js';
import { useRouter } from '@/router.js';

const router = useRouter();
const installThemeCode = ref<string | null>(null);

function previewTheme(code: string): void {
	try {
		const theme = parseThemeCode(code);
		themeManager.previewTheme(theme);
	} catch (err) {
		os.alert({
			type: 'error',
			text: localeRef.value.env._theme.invalid,
		});
		console.error(err);
	}
}

async function install(code: string): Promise<void> {
	try {
		const theme = parseThemeCode(code);
		await installTheme(code);
		os.alert({
			type: 'success',
			text: localizerRef.value.env._theme.installed({ name: theme.name }),
		});
		installThemeCode.value = null;
		router.push('/settings/theme');
	} catch (err: any) {
		handleThemeInstallError(err);
	}
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env._theme.install,
	icon: 'ti ti-download',
}));
</script>
