<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs" :swipable="true">
	<div v-if="tab === 'featured'">
		<XFeatured/>
	</div>
	<div v-else-if="tab === 'users'">
		<XUsers/>
	</div>
	<div v-else-if="tab === 'roles'">
		<XRoles/>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { computed, watch, ref, useTemplateRef } from 'vue';
import XFeatured from './explore.featured.vue';
import XUsers from './explore.users.vue';
import XRoles from './explore.roles.vue';
import { definePage } from '@/page.js';
const localeRef = useLocale(import.meta.url);

const props = withDefaults(defineProps<{
	initialTab?: string;
}>(), {
	initialTab: 'featured',
});

const tab = ref(props.initialTab);

const headerActions = computed(() => []);

const headerTabs = computed(() => [{
	key: 'featured',
	icon: 'ti ti-bolt',
	title: localeRef.value.env.featured,
}, {
	key: 'users',
	icon: 'ti ti-users',
	title: localeRef.value.env.users,
}, {
	key: 'roles',
	icon: 'ti ti-badges',
	title: localeRef.value.env.roles,
}]);

definePage(() => ({
	title: localeRef.value.env.explore,
	icon: 'ti ti-hash',
}));
</script>
