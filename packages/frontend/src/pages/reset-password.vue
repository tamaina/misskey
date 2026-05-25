<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="headerActions" :tabs="headerTabs">
	<div v-if="token" class="_spacer" style="--MI_SPACER-w: 700px; --MI_SPACER-min: 16px; --MI_SPACER-max: 32px;">
		<div class="_gaps_m">
			<MkInput v-model="password" type="password">
				<template #prefix><i class="ti ti-lock"></i></template>
				<template #label>{{ $locale.env.newPassword }}</template>
			</MkInput>

			<MkButton primary @click="save">{{ $locale.env.save }}</MkButton>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { $locale as localeRef } from '@/i18n.js';

import { defineAsyncComponent, onMounted, ref, computed } from 'vue';
import MkInput from '@/components/MkInput.vue';
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os.js';
import { definePage } from '@/page.js';
import { mainRouter } from '@/router.js';

const props = defineProps<{
	token?: string;
}>();

const password = ref('');

async function save() {
	if (props.token == null) return;
	await os.apiWithDialog('reset-password', {
		token: props.token,
		password: password.value,
	});
	mainRouter.push('/');
}

onMounted(async () => {
	if (props.token == null) {
		const { dispose } = await os.popupAsyncWithDialog(import('@/components/MkForgotPassword.vue').then(x => x.default), {}, {
			closed: () => dispose(),
		});
		mainRouter.push('/');
	}
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env.resetPassword,
	icon: 'ti ti-lock',
}));
</script>
