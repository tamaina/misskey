<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="headerActions" :tabs="headerTabs">
	<MkAntennaEditor @created="onAntennaCreated"/>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { computed } from 'vue';
import { definePage } from '@/page.js';
import { antennasCache } from '@/cache.js';
import { useRouter } from '@/router.js';
import MkAntennaEditor from '@/components/MkAntennaEditor.vue';
const localeRef = useLocale(import.meta.url);

const router = useRouter();

function onAntennaCreated() {
	antennasCache.delete();
	router.push('/my/antennas');
}

const headerActions = computed(() => []);
const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env.createAntenna,
	icon: 'ti ti-antenna',
}));
</script>
