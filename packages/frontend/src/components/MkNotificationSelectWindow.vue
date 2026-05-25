<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkModalWindow
	ref="dialog"
	:width="400"
	:height="450"
	:withOkButton="true"
	:okButtonDisabled="false"
	@ok="ok()"
	@close="dialog?.close()"
	@closed="emit('closed')"
>
	<template #header>{{ $locale.env.notificationSetting }}</template>

	<div class="_spacer" style="--MI_SPACER-min: 20px; --MI_SPACER-max: 28px;">
		<div class="_gaps_m">
			<MkInfo>{{ $locale.env.notificationSettingDesc }}</MkInfo>
			<div class="_buttons">
				<MkButton inline @click="disableAll">{{ $locale.env.disableAll }}</MkButton>
				<MkButton inline @click="enableAll">{{ $locale.env.enableAll }}</MkButton>
			</div>
			<MkSwitch v-for="ntype in notificationTypes" :key="ntype" v-model="typesMap[ntype].value">{{ $locale.env._notification._types[ntype] }}</MkSwitch>
		</div>
	</div>
</MkModalWindow>
</template>

<script lang="ts" setup>

import { ref, useTemplateRef } from 'vue';
import { notificationTypes } from 'misskey-js';
import MkSwitch from './MkSwitch.vue';
import MkInfo from './MkInfo.vue';
import MkButton from './MkButton.vue';
import type { Ref } from 'vue';
import MkModalWindow from '@/components/MkModalWindow.vue';

type TypesMap = Record<typeof notificationTypes[number], Ref<boolean>>;

const emit = defineEmits<{
	(ev: 'done', v: { excludeTypes: typeof notificationTypes[number][] }): void,
	(ev: 'closed'): void,
}>();

const props = withDefaults(defineProps<{
	excludeTypes?: typeof notificationTypes[number][];
}>(), {
	excludeTypes: () => [],
});

const dialog = useTemplateRef('dialog');

const typesMap = notificationTypes.reduce((p, t) => ({ ...p, [t]: ref<boolean>(!props.excludeTypes.includes(t)) }), {} as TypesMap);

function ok() {
	emit('done', {
		excludeTypes: (Object.keys(typesMap) as typeof notificationTypes[number][])
			.filter(type => !typesMap[type].value),
	});

	if (dialog.value) dialog.value.close();
}

function disableAll() {
	for (const type of notificationTypes) {
		typesMap[type].value = false;
	}
}

function enableAll() {
	for (const type of notificationTypes) {
		typesMap[type].value = true;
	}
}
</script>
