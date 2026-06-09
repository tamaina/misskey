<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs" :swipable="true">
	<MkPolkadots v-if="tab === 'home'" accented :height="200" style="margin-bottom: -200px;"/>
	<div class="_spacer" style="--MI_SPACER-w: 700px;">
		<XHome v-if="tab === 'home'"/>
		<XInvitations v-else-if="tab === 'invitations'"/>
		<XJoiningRooms v-else-if="tab === 'joiningRooms'"/>
		<XOwnedRooms v-else-if="tab === 'ownedRooms'"/>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { computed, ref } from 'vue';
import XHome from './home.home.vue';
import XInvitations from './home.invitations.vue';
import XJoiningRooms from './home.joiningRooms.vue';
import XOwnedRooms from './home.ownedRooms.vue';
import { definePage } from '@/page.js';
import MkPolkadots from '@/components/MkPolkadots.vue';
const localeRef = useLocale(import.meta.url);

const tab = ref('home');

const headerActions = computed(() => []);

const headerTabs = computed(() => [{
	key: 'home',
	title: localeRef.value.env._chat.home,
	icon: 'ti ti-home',
}, {
	key: 'invitations',
	title: localeRef.value.env._chat.invitations,
	icon: 'ti ti-ticket',
}, {
	key: 'joiningRooms',
	title: localeRef.value.env._chat.joiningRooms,
	icon: 'ti ti-users-group',
}, {
	key: 'ownedRooms',
	title: localeRef.value.env._chat.yourRooms,
	icon: 'ti ti-settings',
}]);

definePage(() => ({
	title: localeRef.value.env.directMessage,
	icon: 'ti ti-messages',
}));
</script>

<style lang="scss" module>
</style>
