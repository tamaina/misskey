<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="headerActions" :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 600px; --MI_SPACER-min: 16px;">
		<div class="_gaps_m">
			<FormInfo warn>{{ $locale.env.editTheseSettingsMayBreakAccount }}</FormInfo>

			<template v-if="value">
				<FormSplit>
					<MkKeyValue>
						<template #key>{{ $locale.env._registry.domain }}</template>
						<template #value>{{ props.domain === '@' ? $locale.env.system : props.domain.toUpperCase() }}</template>
					</MkKeyValue>
					<MkKeyValue>
						<template #key>{{ $locale.env._registry.scope }}</template>
						<template #value>{{ scope.join('/') }}</template>
					</MkKeyValue>
					<MkKeyValue>
						<template #key>{{ $locale.env._registry.key }}</template>
						<template #value>{{ key }}</template>
					</MkKeyValue>
				</FormSplit>

				<MkCodeEditor v-model="valueForEditor" lang="json5">
					<template #label>{{ $locale.env.value }} (JSON)</template>
				</MkCodeEditor>

				<MkButton primary @click="save"><i class="ti ti-device-floppy"></i> {{ $locale.env.save }}</MkButton>

				<MkKeyValue>
					<template #key>{{ $locale.env.updatedAt }}</template>
					<template #value><MkTime :time="value.updatedAt" mode="detail"/></template>
				</MkKeyValue>

				<MkButton danger @click="del"><i class="ti ti-trash"></i> {{ $locale.env.delete }}</MkButton>
			</template>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { watch, computed, ref } from 'vue';
import JSON5 from 'json5';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { definePage } from '@/page.js';
import MkButton from '@/components/MkButton.vue';
import MkKeyValue from '@/components/MkKeyValue.vue';
import MkCodeEditor from '@/components/MkCodeEditor.vue';
import FormSplit from '@/components/form/split.vue';
import FormInfo from '@/components/MkInfo.vue';
const localeRef = useLocale(import.meta.url);

const props = defineProps<{
	path: string;
	domain: string;
}>();

const scope = computed(() => props.path.split('/').slice(0, -1));
const key = computed(() => props.path.split('/').at(-1)!);

const value = ref<any>(null);
const valueForEditor = ref<string>('');

function fetchValue() {
	misskeyApi('i/registry/get-detail', {
		scope: scope.value,
		key: key.value,
		domain: props.domain === '@' ? null : props.domain,
	}).then(res => {
		value.value = res;
		valueForEditor.value = JSON5.stringify(res.value, null, '\t');
	});
}

async function save() {
	try {
		JSON5.parse(valueForEditor.value);
	} catch (err) {
		os.alert({
			type: 'error',
			text: localeRef.value.env.invalidValue,
		});
		return;
	}
	os.confirm({
		type: 'warning',
		text: localeRef.value.env.saveConfirm,
	}).then(({ canceled }) => {
		if (canceled) return;
		os.apiWithDialog('i/registry/set', {
			scope: scope.value,
			key: key.value,
			value: JSON5.parse(valueForEditor.value),
			domain: props.domain === '@' ? null : props.domain,
		});
	});
}

function del() {
	os.confirm({
		type: 'warning',
		text: localeRef.value.env.deleteConfirm,
	}).then(({ canceled }) => {
		if (canceled) return;
		os.apiWithDialog('i/registry/remove', {
			scope: scope.value,
			key: key.value,
			domain: props.domain === '@' ? null : props.domain,
		});
	});
}

watch(() => props.path, fetchValue, { immediate: true });

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env.registry,
	icon: 'ti ti-adjustments',
}));
</script>
