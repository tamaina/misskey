<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkModalWindow
	ref="dialog"
	:width="370"
	:height="400"
	@close="dialog?.close()"
	@closed="emit('closed')"
>
	<template #header>{{ $locale.env.forgotPassword }}</template>

	<div class="_spacer" style="--MI_SPACER-min: 20px; --MI_SPACER-max: 28px;">
		<form v-if="instance.enableEmail" @submit.prevent="onSubmit">
			<div class="_gaps_m">
				<MkInput v-model="username" type="text" pattern="^[a-zA-Z0-9_]+$" :spellcheck="false" autofocus required>
					<template #label>{{ $locale.env.username }}</template>
					<template #prefix>@</template>
				</MkInput>

				<MkInput v-model="email" type="email" :spellcheck="false" required>
					<template #label>{{ $locale.env.emailAddress }}</template>
					<template #caption>{{ $locale.env._forgotPassword.enterEmail }}</template>
				</MkInput>

				<MkButton type="submit" rounded :disabled="processing" primary style="margin: 0 auto;">{{ $locale.env.send }}</MkButton>

				<MkInfo>{{ $locale.env._forgotPassword.ifNoEmail }}</MkInfo>
			</div>
		</form>
		<div v-else>
			{{ $locale.env._forgotPassword.contactAdmin }}
		</div>
	</div>
</MkModalWindow>
</template>

<script lang="ts" setup>

import { ref, useTemplateRef } from 'vue';
import MkModalWindow from '@/components/MkModalWindow.vue';
import MkButton from '@/components/MkButton.vue';
import MkInput from '@/components/MkInput.vue';
import MkInfo from '@/components/MkInfo.vue';
import * as os from '@/os.js';
import { instance } from '@/instance.js';

const emit = defineEmits<{
	(ev: 'done'): void;
	(ev: 'closed'): void;
}>();

const dialog = useTemplateRef('dialog');

const username = ref('');
const email = ref('');
const processing = ref(false);

async function onSubmit() {
	processing.value = true;
	await os.apiWithDialog('request-reset-password', {
		username: username.value,
		email: email.value,
	});
	emit('done');
	dialog.value?.close();
}
</script>
