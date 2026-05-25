<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m" :class="$style.extInstallerRoot">
	<div :class="$style.extInstallerIconWrapper">
		<i v-if="isPlugin" class="ti ti-plug"></i>
		<i v-else-if="isTheme" class="ti ti-palette"></i>
		<!-- 拡張用？ -->
		<i v-else class="ti ti-download"></i>
	</div>

	<h2 v-if="isPlugin" :class="$style.extInstallerTitle">{{ $locale.env._externalResourceInstaller._plugin.title }}</h2>
	<h2 v-else-if="isTheme" :class="$style.extInstallerTitle">{{ $locale.env._externalResourceInstaller._theme.title }}</h2>

	<MkInfo :warn="true">{{ $locale.env._externalResourceInstaller.checkVendorBeforeInstall }}</MkInfo>

	<div v-if="extension.type === 'plugin'" class="_gaps_s">
		<MkFolder :defaultOpen="true">
			<template #icon><i class="ti ti-info-circle"></i></template>
			<template #label>{{ $locale.env.metadata }}</template>

			<div class="_gaps_s">
				<FormSplit>
					<MkKeyValue>
						<template #key>{{ $locale.env.name }}</template>
						<template #value>{{ extension.meta.name }}</template>
					</MkKeyValue>
					<MkKeyValue>
						<template #key>{{ $locale.env.author }}</template>
						<template #value>{{ extension.meta.author }}</template>
					</MkKeyValue>
				</FormSplit>
				<MkKeyValue>
					<template #key>{{ $locale.env.description }}</template>
					<template #value>{{ extension.meta.description ?? $locale.env.none }}</template>
				</MkKeyValue>
				<MkKeyValue>
					<template #key>{{ $locale.env.version }}</template>
					<template #value>{{ extension.meta.version }}</template>
				</MkKeyValue>
				<MkKeyValue>
					<template #key>{{ $locale.env.permission }}</template>
					<template #value>
						<ul v-if="extension.meta.permissions && extension.meta.permissions.length > 0" :class="$style.extInstallerKVList">
							<li v-for="permission in extension.meta.permissions" :key="permission">{{ $locale.env._permissions[permission] ?? permission }}</li>
						</ul>
						<template v-else>{{ $locale.env.none }}</template>
					</template>
				</MkKeyValue>
			</div>
		</MkFolder>

		<MkFolder :withSpacer="false">
			<template #icon><i class="ti ti-code"></i></template>
			<template #label>{{ $locale.env._plugin.viewSource }}</template>

			<MkCode :code="extension.raw"/>
		</MkFolder>
	</div>
	<div v-else-if="extension.type === 'theme'" class="_gaps_s">
		<MkFolder :defaultOpen="true">
			<template #icon><i class="ti ti-info-circle"></i></template>
			<template #label>{{ $locale.env.metadata }}</template>

			<div class="_gaps_s">
				<FormSplit>
					<MkKeyValue>
						<template #key>{{ $locale.env.name }}</template>
						<template #value>{{ extension.meta.name }}</template>
					</MkKeyValue>
					<MkKeyValue>
						<template #key>{{ $locale.env.author }}</template>
						<template #value>{{ extension.meta.author }}</template>
					</MkKeyValue>
				</FormSplit>
				<MkKeyValue>
					<template #key>{{ $locale.env._externalResourceInstaller._meta.base }}</template>
					<template #value>{{ { light: $locale.env.light, dark: $locale.env.dark, none: $locale.env.none }[extension.meta.base ?? 'none'] }}</template>
				</MkKeyValue>
			</div>
		</MkFolder>

		<MkFolder :withSpacer="false">
			<template #icon><i class="ti ti-code"></i></template>
			<template #label>{{ $locale.env._theme.code }}</template>

			<MkCode :code="extension.raw"/>
		</MkFolder>
	</div>

	<slot name="additionalInfo"></slot>

	<div class="_buttonsCenter">
		<MkButton danger rounded large @click="emits('cancel')"><i class="ti ti-x"></i> {{ $locale.env.cancel }}</MkButton>
		<MkButton gradate rounded large @click="emits('confirm')"><i class="ti ti-download"></i> {{ $locale.env.install }}</MkButton>
	</div>
</div>
</template>

<script lang="ts">
import * as Misskey from 'misskey-js';

export type Extension = {
	type: 'plugin';
	raw: string;
	meta: {
		name: string;
		version: string;
		author: string;
		description?: string;
		permissions?: (typeof Misskey.permissions)[number][];
		config?: Record<string, unknown>;
	};
} | {
	type: 'theme';
	raw: string;
	meta: {
		name: string;
		author: string;
		base?: 'light' | 'dark';
	};
};
</script>
<script lang="ts" setup>

import { computed } from 'vue';
import MkButton from '@/components/MkButton.vue';
import FormSplit from '@/components/form/split.vue';
import MkCode from '@/components/MkCode.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkFolder from '@/components/MkFolder.vue';
import MkKeyValue from '@/components/MkKeyValue.vue';

const isPlugin = computed(() => props.extension.type === 'plugin');
const isTheme = computed(() => props.extension.type === 'theme');

const props = defineProps<{
	extension: Extension;
}>();

const emits = defineEmits<{
	(ev: 'confirm'): void;
	(ev: 'cancel'): void;
}>();
</script>

<style lang="scss" module>
.extInstallerRoot {
	border-radius: var(--MI-radius);
	background: var(--MI_THEME-panel);
	padding: 20px;
}

.extInstallerIconWrapper {
	width: 48px;
	height: 48px;
	font-size: 20px;
	line-height: 48px;
	text-align: center;
	border-radius: 50%;
	margin-left: auto;
	margin-right: auto;

	background-color: var(--MI_THEME-accentedBg);
	color: var(--MI_THEME-accent);
}

.extInstallerTitle {
	font-size: 1.2rem;
	text-align: center;
	margin: 0;
}

.extInstallerKVList {
	margin-top: 0;
	margin-bottom: 0;
}
</style>
