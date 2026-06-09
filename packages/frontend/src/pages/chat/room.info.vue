<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps">
	<MkInput v-model="name_" :disabled="!isOwner">
		<template #label>{{ $locale.env.name }}</template>
	</MkInput>

	<MkTextarea v-model="description_" :disabled="!isOwner">
		<template #label>{{ $locale.env.description }}</template>
	</MkTextarea>

	<MkButton v-if="isOwner" primary @click="save">{{ $locale.env.save }}</MkButton>

	<hr>

	<MkButton v-if="isOwner || ($i.isAdmin || $i.isModerator)" danger @click="del">{{ $locale.env._chat.deleteRoom }}</MkButton>

	<MkSwitch v-if="!isOwner" v-model="isMuted">
		<template #label>{{ $locale.env._chat.muteThisRoom }}</template>
	</MkSwitch>
</div>
</template>

<script lang="ts" setup>
import { useLocalizer } from 'virtual:vite-vue-internationalization';

import { computed, ref, watch } from 'vue';
import * as Misskey from 'misskey-js';
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os.js';
import { ensureSignin } from '@/i.js';
import MkInput from '@/components/MkInput.vue';
import MkTextarea from '@/components/MkTextarea.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import { useRouter } from '@/router.js';
const localizerRef = useLocalizer(import.meta.url);

const router = useRouter();
const $i = ensureSignin();

const props = defineProps<{
	room: Misskey.entities.ChatRoom;
}>();

const isOwner = computed(() => {
	return props.room.ownerId === $i.id;
});

const name_ = ref(props.room.name);
const description_ = ref(props.room.description);

function save() {
	os.apiWithDialog('chat/rooms/update', {
		roomId: props.room.id,
		name: name_.value,
		description: description_.value,
	});
}

async function del() {
	const { canceled } = await os.confirm({
		type: 'warning',
		text: localizerRef.value.env.deleteAreYouSure({ x: name_.value }),
	});
	if (canceled) return;

	await os.apiWithDialog('chat/rooms/delete', {
		roomId: props.room.id,
	});
	router.push('/chat');
}

const isMuted = ref(props.room.isMuted ?? false);

watch(isMuted, async () => {
	await os.apiWithDialog('chat/rooms/mute', {
		roomId: props.room.id,
		mute: isMuted.value,
	});
});
</script>

<style lang="scss" module>
.membership {
	display: flex;
}

.membershipBody {
	flex: 1;
	min-width: 0;
	margin-right: 8px;

	&:hover {
		text-decoration: none;
	}
}
</style>
