<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<section>
	<div v-if="permissions.length > 0">
		<p>{{ $l.env._auth.permission({ name }) }}</p>
		<ul>
			<li v-for="p in permissions" :key="p">{{ $locale.env._permissions[p] ?? p }}</li>
		</ul>
	</div>
	<div>{{ $l.env._auth.shareAccess({ name: `${name} (${app.id})` }) }}</div>
	<div :class="$style.buttons">
		<MkButton inline @click="cancel">{{ $locale.env.cancel }}</MkButton>
		<MkButton inline primary @click="accept">{{ $locale.env.accept }}</MkButton>
	</div>
</section>
</template>

<script lang="ts" setup>

import { computed } from 'vue';
import * as Misskey from 'misskey-js';
import MkButton from '@/components/MkButton.vue';
import { misskeyApi } from '@/utility/misskey-api.js';

const props = defineProps<{
	session: Misskey.entities.AuthSessionShowResponse;
}>();

const emit = defineEmits<{
	(event: 'accepted'): void;
	(event: 'denied'): void;
}>();

const app = computed(() => props.session.app);

const permissions = computed(() => {
	return props.session.app.permission.filter((p): p is typeof Misskey.permissions[number] => typeof p === 'string');
});

const name = computed(() => {
	const el = window.document.createElement('div');
	el.textContent = app.value.name;
	return el.innerHTML;
});

function cancel() {
	//misskeyApi('auth/deny', {
	//	token: props.session.token,
	//}).then(() => {
	//	emit('denied');
	//});

	emit('denied');
}

function accept() {
	misskeyApi('auth/accept', {
		token: props.session.token,
	}).then(() => {
		emit('accepted');
	});
}
</script>

<style lang="scss" module>
.buttons {
	margin-top: 16px;
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
}
</style>
