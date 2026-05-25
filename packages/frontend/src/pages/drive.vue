<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div>
	<MkDrive @cd="x => folder = x"/>
</div>
</template>

<script lang="ts" setup>
import { $locale as localeRef } from '@/i18n.js';

import { computed, ref } from 'vue';
import * as Misskey from 'misskey-js';
import MkDrive from '@/components/MkDrive.vue';
import { definePage } from '@/page.js';

const folder = ref<Misskey.entities.DriveFolder | null>(null);

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: folder.value ? folder.value.name : localeRef.value.env.drive,
	icon: 'ti ti-cloud',
	hideHeader: true,
}));
</script>
