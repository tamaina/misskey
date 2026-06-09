<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div style="align-content: center; height: 100cqh;">
	<MkResult type="notFound" :text="$locale.env.notFoundDescription"/>
</div>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { computed } from 'vue';
import { definePage } from '@/page.js';
import { pleaseLogin } from '@/utility/please-login.js';
const localeRef = useLocale(import.meta.url);

const props = defineProps<{
	showLoginPopup?: boolean;
}>();

if (props.showLoginPopup) {
	pleaseLogin({ path: '/' });
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env.notFound,
	icon: 'ti ti-alert-triangle',
}));
</script>
