<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader v-model:tab="headerTab" :tabs="headerTabs">
	<XGridLocalComponent v-if="headerTab === 'local'" :class="$style.local"/>
	<XGridRemoteComponent v-else-if="headerTab === 'remote'"/>
	<XRegisterComponent v-else-if="headerTab === 'register'"/>
</PageWithHeader>
</template>

<script setup lang="ts">
import { $locale as localeRef } from '@/i18n.js';

import { computed, ref } from 'vue';
import { definePage } from '@/page.js';
import XGridLocalComponent from '@/pages/admin/custom-emojis-manager.local.list.vue';
import XGridRemoteComponent from '@/pages/admin/custom-emojis-manager.remote.vue';
import XRegisterComponent from '@/pages/admin/custom-emojis-manager.register.vue';

type PageMode = 'local' | 'remote';

const headerTab = ref<PageMode>('local');

const headerTabs = computed(() => [{
	key: 'local',
	title: localeRef.value.env.local,
}, {
	key: 'remote',
	title: localeRef.value.env.remote,
}, {
	key: 'register',
	title: localeRef.value.env._customEmojisManager._local.tabTitleRegister,
}]);

definePage(computed(() => ({
	title: localeRef.value.env.customEmojis,
	icon: 'ti ti-icons',
	needWideArea: true,
})));
</script>

<style lang="css" module>
.local {
	height: calc(100dvh - var(--MI-stickyTop) - var(--MI-stickyBottom));
	overflow: clip;
}
</style>
