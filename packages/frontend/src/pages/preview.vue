<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div>
	<MkSample/>
</div>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { computed } from 'vue';
import MkSample from '@/components/MkPreview.vue';
import { definePage } from '@/page.js';
const localeRef = useLocale(import.meta.url);

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(computed(() => ({
	title: localeRef.value.env.preview,
	icon: 'ti ti-eye',
})));
</script>
