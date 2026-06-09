<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps">
	<MkButton v-if="$i.policies.chatAvailability === 'available'" primary gradate rounded :class="$style.start" @click="start"><i class="ti ti-plus"></i> {{ $locale.env.startChat }}</MkButton>

	<MkInfo v-else>{{ $i.policies.chatAvailability === 'readonly' ? $locale.env._chat.chatIsReadOnlyForThisAccountOrServer : $locale.env._chat.chatNotAvailableForThisAccountOrServer }}</MkInfo>

	<MkAd :preferForms="['horizontal', 'horizontal-big']"/>

	<MkInput
		v-model="searchQuery"
		:placeholder="$locale.env._chat.searchMessages"
		type="search"
	>
		<template #prefix><i class="ti ti-search"></i></template>
	</MkInput>

	<MkButton v-if="searchQuery.length > 0" primary rounded @click="search">{{ $locale.env.search }}</MkButton>

	<MkFoldableSection v-if="searched">
		<template #header>{{ $locale.env.searchResult }}</template>

		<div class="_gaps_s">
			<div v-for="message in searchResults" :key="message.id" :class="$style.searchResultItem">
				<XMessage :message="message" :isSearchResult="true"/>
			</div>
		</div>
	</MkFoldableSection>

	<MkFoldableSection>
		<template #header>{{ $locale.env._chat.history }}</template>

		<MkChatHistories/>
	</MkFoldableSection>
</div>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { onActivated, onDeactivated, onMounted, ref } from 'vue';
import * as Misskey from 'misskey-js';
import { useInterval } from '@@/js/use-interval.js';
import XMessage from './XMessage.vue';
import MkButton from '@/components/MkButton.vue';
import { misskeyApi } from '@/utility/misskey-api.js';
import { ensureSignin } from '@/i.js';
import { useRouter } from '@/router.js';
import * as os from '@/os.js';
import { updateCurrentAccountPartial } from '@/accounts.js';
import MkInput from '@/components/MkInput.vue';
import MkFoldableSection from '@/components/MkFoldableSection.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkChatHistories from '@/components/MkChatHistories.vue';
const localeRef = useLocale(import.meta.url);

const $i = ensureSignin();

const router = useRouter();

const searchQuery = ref('');
const searched = ref(false);
const searchResults = ref<Misskey.entities.ChatMessage[]>([]);

function start(ev: PointerEvent) {
	os.popupMenu([{
		text: localeRef.value.env._chat.individualChat,
		caption: localeRef.value.env._chat.individualChat_description,
		icon: 'ti ti-user',
		action: () => { startUser(); },
	}, { type: 'divider' }, {
		type: 'parent',
		text: localeRef.value.env._chat.roomChat,
		caption: localeRef.value.env._chat.roomChat_description,
		icon: 'ti ti-users-group',
		children: [{
			text: localeRef.value.env._chat.createRoom,
			icon: 'ti ti-plus',
			action: () => { createRoom(); },
		}],
	}], ev.currentTarget ?? ev.target);
}

async function startUser() {
	// TODO: localOnly は連合に対応したら消す
	os.selectUser({ localOnly: true }).then(user => {
		router.push('/chat/user/:userId', {
			params: {
				userId: user.id,
			},
		});
	});
}

async function createRoom() {
	const { canceled, result } = await os.inputText({
		title: localeRef.value.env.name,
		minLength: 1,
	});
	if (canceled) return;

	const room = await misskeyApi('chat/rooms/create', {
		name: result,
	});

	router.push('/chat/room/:roomId', {
		params: {
			roomId: room.id,
		},
	});
}

async function search() {
	const res = await misskeyApi('chat/messages/search', {
		query: searchQuery.value,
	});

	searchResults.value = res;
	searched.value = true;
}

onMounted(() => {
	updateCurrentAccountPartial({ hasUnreadChatMessages: false });
});
</script>

<style lang="scss" module>
.start {
	margin: 0 auto;
}

.searchResultItem {
	padding: 12px;
	border: solid 1px var(--MI_THEME-divider);
	border-radius: 12px;
}
</style>
