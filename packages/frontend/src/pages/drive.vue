<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div ref="scrollContainer" class="_pageScrollable">
	<MkDrive @cd="x => folder = x"/>
</div>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { computed, ref, useTemplateRef } from 'vue';
import * as Misskey from 'misskey-js';
import MkDrive from '@/components/MkDrive.vue';
import { definePage } from '@/page.js';
import { useScrollPositionKeeper } from '@/composables/use-scroll-position-keeper.js';

const scrollContainer = useTemplateRef('scrollContainer');
useScrollPositionKeeper(scrollContainer);
const localeRef = useLocale(import.meta.url);

const folder = ref<Misskey.entities.DriveFolder | null>(null);

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: folder.value ? folder.value.name : localeRef.value.env.drive,
	icon: 'ti ti-cloud',
	hideHeader: true,
}));
</script>
