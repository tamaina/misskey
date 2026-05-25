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
import { $locale as localeRef } from '@/i18n.js';

import { computed } from 'vue';
import MkSample from '@/components/MkPreview.vue';
import { definePage } from '@/page.js';

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(computed(() => ({
	title: localeRef.value.env.preview,
	icon: 'ti ti-eye',
})));
</script>
