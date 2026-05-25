<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="headerActions" :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 500px;">
		<div v-if="state == 'fetch-session-error'">
			<p>{{ $locale.env.somethingHappened }}</p>
		</div>
		<div v-else-if="$i && !session">
			<MkLoading/>
		</div>
		<div v-else-if="$i && session">
			<XForm
				v-if="state == 'waiting'"
				class="form"
				:session="session"
				@denied="state = 'denied'"
				@accepted="accepted"
			/>
			<div v-if="state == 'denied'">
				<h1>{{ $locale.env._auth.denied }}</h1>
			</div>
			<div v-if="state == 'accepted' && session">
				<h1>{{ session.app.isAuthorized ? $locale.env._auth.alreadyAuthorized : $locale.env._auth.accepted }}</h1>
				<p v-if="session.app.callbackUrl">
					{{ $locale.env._auth.callback }}
					<MkEllipsis/>
				</p>
				<p v-if="!session.app.callbackUrl">{{ $locale.env._auth.pleaseGoBack }}</p>
			</div>
		</div>
		<div v-else>
			<p :class="$style.loginMessage">{{ $locale.env._auth.pleaseLogin }}</p>
			<MkSignin @login="onLogin"/>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { $locale as localeRef } from '@/i18n.js';

import { onMounted, ref, computed } from 'vue';
import * as Misskey from 'misskey-js';
import XForm from './auth.form.vue';
import MkSignin from '@/components/MkSignin.vue';
import { misskeyApi } from '@/utility/misskey-api.js';
import { $i } from '@/i.js';
import { definePage } from '@/page.js';
import { login } from '@/accounts.js';

const props = defineProps<{
	token: string;
}>();

const state = ref<'waiting' | 'accepted' | 'fetch-session-error' | 'denied' | null>(null);
const session = ref<Misskey.entities.AuthSessionShowResponse | null>(null);

function accepted() {
	state.value = 'accepted';
	if (session.value && session.value.app.callbackUrl) {
		const url = new URL(session.value.app.callbackUrl);
		if (['javascript:', 'file:', 'data:', 'mailto:', 'tel:', 'vbscript:'].includes(url.protocol)) throw new Error('invalid url');
		window.location.href = `${session.value.app.callbackUrl}?token=${session.value.token}`;
	}
}

function onLogin(res: Misskey.entities.SigninFlowResponse & { finished: true }) {
	login(res.i);
}

onMounted(async () => {
	if (!$i) return;

	try {
		const result = await misskeyApi('auth/session/show', {
			token: props.token,
		});
		session.value = result;

		// 既に連携していた場合
		if (result.app.isAuthorized) {
			await misskeyApi('auth/accept', {
				token: result.token,
			});
			accepted();
		} else {
			state.value = 'waiting';
		}
	} catch (err) {
		state.value = 'fetch-session-error';
	}
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env._auth.shareAccessTitle,
	icon: 'ti ti-apps',
}));
</script>

<style lang="scss" module>
.loginMessage {
	text-align: center;
	margin: 8px 0 24px;
}
</style>
