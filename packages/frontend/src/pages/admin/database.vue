<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="headerActions" :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 800px; --MI_SPACER-min: 16px; --MI_SPACER-max: 32px;">
		<MkSuspense v-slot="{ result: database }" :p="databasePromiseFactory">
			<MkKeyValue v-for="table in database" :key="table[0]" oneline style="margin: 1em 0;">
				<template #key>{{ table[0] }}</template>
				<template #value>{{ bytes(table[1].size) }} ({{ number(table[1].count) }} recs)</template>
			</MkKeyValue>
		</MkSuspense>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { computed } from 'vue';
import MkKeyValue from '@/components/MkKeyValue.vue';
import { misskeyApi } from '@/utility/misskey-api.js';
import bytes from '@/filters/bytes.js';
import number from '@/filters/number.js';
import { definePage } from '@/page.js';
const localeRef = useLocale(import.meta.url);

const databasePromiseFactory = () => misskeyApi('admin/get-table-stats').then(res => Object.entries(res).sort((a, b) => b[1].size - a[1].size));

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env.database,
	icon: 'ti ti-database',
}));
</script>
