<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithAnimBg>
	<div :class="$style.formContainer">
		<div :class="$style.form" class="_panel">
			<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="z-index:1;position:relative" viewBox="0 0 854 300">
				<defs>
					<linearGradient id="linear" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stop-color="#86b300"/><stop offset="100%" stop-color="#4ab300"/>
					</linearGradient>
				</defs>

				<g transform="translate(427, 150) scale(1, 1) translate(-427, -150)">
					<path d="" fill="url(#linear)" opacity="0.4">
						<animate
							attributeName="d"
							dur="20s"
							repeatCount="indefinite"
							keyTimes="0;0.333;0.667;1"
							calcmod="spline"
							keySplines="0.2 0 0.2 1;0.2 0 0.2 1;0.2 0 0.2 1"
							begin="0s"
							values="M0 0L 0 220Q 213.5 260 427 230T 854 255L 854 0 Z;M0 0L 0 245Q 213.5 260 427 240T 854 230L 854 0 Z;M0 0L 0 265Q 213.5 235 427 265T 854 230L 854 0 Z;M0 0L 0 220Q 213.5 260 427 230T 854 255L 854 0 Z"
						>
						</animate>
					</path>
					<path d="" fill="url(#linear)" opacity="0.4">
						<animate
							attributeName="d"
							dur="20s"
							repeatCount="indefinite"
							keyTimes="0;0.333;0.667;1"
							calcmod="spline"
							keySplines="0.2 0 0.2 1;0.2 0 0.2 1;0.2 0 0.2 1"
							begin="-10s"
							values="M0 0L 0 235Q 213.5 280 427 250T 854 260L 854 0 Z;M0 0L 0 250Q 213.5 220 427 220T 854 240L 854 0 Z;M0 0L 0 245Q 213.5 225 427 250T 854 265L 854 0 Z;M0 0L 0 235Q 213.5 280 427 250T 854 260L 854 0 Z"
						>
						</animate>
					</path>
				</g>
			</svg>
			<div :class="$style.title">
				<div>Welcome to Misskey!</div>
				<div :class="$style.version">v{{ version }}</div>
			</div>
			<div style="padding: 16px 32px 32px 32px;">
				<form v-if="!accountCreated" class="_gaps_m" @submit.prevent="createAccount()">
					<div style="text-align: center;" class="_gaps_s">
						<div><b>{{ $locale.env._serverSetupWizard.installCompleted }}</b></div>
						<div>{{ $locale.env._serverSetupWizard.firstCreateAccount }}</div>
					</div>
					<MkInput v-model="setupPassword" type="password" data-cy-admin-initial-password>
						<template #label>{{ $locale.env.initialPasswordForSetup }} <div v-tooltip:dialog="$locale.env.initialPasswordForSetupDescription" class="_button _help"><i class="ti ti-help-circle"></i></div></template>
						<template #prefix><i class="ti ti-lock"></i></template>
					</MkInput>
					<MkInput v-model="username" pattern="^[a-zA-Z0-9_]{1,20}$" :spellcheck="false" required data-cy-admin-username>
						<template #label>{{ $locale.env.username }} <div v-tooltip:dialog="$locale.env.usernameInfo" class="_button _help"><i class="ti ti-help-circle"></i></div></template>
						<template #prefix>@</template>
						<template #suffix>@{{ host }}</template>
					</MkInput>
					<MkInput v-model="password" type="password" data-cy-admin-password>
						<template #label>{{ $locale.env.password }}</template>
						<template #prefix><i class="ti ti-lock"></i></template>
					</MkInput>
					<div>
						<MkButton gradate large rounded :disabled="accountCreating" data-cy-admin-ok style="margin: 0 auto;" type="submit">
							{{ accountCreating ? $locale.env.processing : $locale.env.next }}<MkEllipsis v-if="accountCreating"/>
						</MkButton>
					</div>
				</form>
				<div v-else-if="step === 0" class="_gaps_m">
					<div style="text-align: center;" class="_gaps_s">
						<div><b>{{ $locale.env._serverSetupWizard.accountCreated }}</b></div>
					</div>
					<MkButton gradate large rounded data-cy-next style="margin: 0 auto;" @click="step++">
						{{ $locale.env.next }}
					</MkButton>
				</div>
				<div v-else-if="step === 1" class="_gaps_m">
					<div style="text-align: center;" class="_gaps_s">
						<div style="font-size: 120%;"><b>{{ $locale.env._serverSetupWizard.serverSetting }}</b></div>
						<div>{{ $locale.env._serverSetupWizard.youCanEasilyConfigureOptimalServerSettingsWithThisWizard }}</div>
						<div>{{ $locale.env._serverSetupWizard.settingsYouMakeHereCanBeChangedLater }}</div>
					</div>

					<Suspense>
						<template #default>
							<MkServerSetupWizard :token="token!" @finished="onWizardFinished"/>
						</template>
						<template #fallback>
							<MkLoading/>
						</template>
					</Suspense>

					<MkButton rounded style="margin: 0 auto;" @click="skipSettings">
						{{ $locale.env._serverSetupWizard.skipSettings }}
					</MkButton>
				</div>
				<div v-else-if="step === 2" class="_gaps_m">
					<div style="text-align: center;" class="_gaps_s">
						<div><b>{{ $locale.env._serverSetupWizard.settingsCompleted }}</b></div>
						<div>{{ $locale.env._serverSetupWizard.settingsCompleted_description }}</div>
						<div>{{ $locale.env._serverSetupWizard.settingsCompleted_description2 }}</div>
					</div>
					<div class="_gaps_s" :class="$style.donation">
						<div><b>{{ $locale.env._serverSetupWizard.donationRequest }}</b></div>
						<div>{{ $locale.env._serverSetupWizard._donationRequest.text1 }}<br>{{ $locale.env._serverSetupWizard._donationRequest.text2 }}<br>{{ $locale.env._serverSetupWizard._donationRequest.text3 }}</div>
						<MkLink target="_blank" url="https://misskey-hub.net/docs/donate/" style="margin: 0 auto;">{{ $locale.env.learnMore }}</MkLink>
					</div>
					<div class="_buttonsCenter">
						<MkButton gradate large rounded data-cy-next style="margin: 0 auto;" @click="finish">
							{{ $locale.env.start }}
						</MkButton>
					</div>
				</div>
			</div>
		</div>
	</div>
</PageWithAnimBg>
</template>

<script lang="ts" setup>
import { $locale as localeRef } from '@/i18n.js';

import { ref } from 'vue';
import { host, version } from '@@/js/config.js';
import MkButton from '@/components/MkButton.vue';
import MkInput from '@/components/MkInput.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { login } from '@/accounts.js';
import MkLink from '@/components/MkLink.vue';
import MkServerSetupWizard from '@/components/MkServerSetupWizard.vue';

const username = ref('');
const password = ref('');
const setupPassword = ref('');
const accountCreating = ref(false);
const accountCreated = ref(false);
const step = ref(0);

let token: string | null = null;

function createAccount() {
	if (accountCreating.value) return;
	accountCreating.value = true;

	const _close = os.waiting();

	misskeyApi('admin/accounts/create', {
		username: username.value,
		password: password.value,
		setupPassword: setupPassword.value === '' ? null : setupPassword.value,
	}).then(res => {
		token = res.token;
		accountCreated.value = true;
	}).catch((err) => {
		accountCreating.value = false;

		let title = localeRef.value.env.somethingHappened;
		let text = err.message + '\n' + err.id;

		if (err.code === 'ACCESS_DENIED') {
			title = localeRef.value.env.permissionDeniedError;
			text = localeRef.value.env.operationForbidden;
		} else if (err.code === 'INCORRECT_INITIAL_PASSWORD') {
			title = localeRef.value.env.permissionDeniedError;
			text = localeRef.value.env.incorrectPassword;
		}

		os.alert({
			type: 'error',
			title,
			text,
		});
	}).finally(() => {
		_close();
	});
}

function onWizardFinished() {
	step.value++;
}

function skipSettings() {
	step.value++;
}

function finish() {
	if (token == null) return;
	login(token);
}
</script>

<style lang="scss" module>
.formContainer {
	min-height: 100svh;
	padding: 32px 32px 64px 32px;
	box-sizing: border-box;
	align-content: center;
}

.form {
	position: relative;
	z-index: 10;
	border-radius: var(--MI-radius);
	box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
	overflow: clip;
	max-width: 550px;
	margin: 0 auto;
}

.title {
	position: absolute;
	top: 16px;
	left: 0;
	right: 0;
	z-index: 1;
	margin: 0;
	font-size: 1.5em;
	text-align: center;
	padding: 32px;
	color: #fff;
	font-weight: bold;
}

.version {
	font-size: 70%;
	font-weight: normal;
	opacity: 0.7;
}

.donation {
	background: var(--MI_THEME-accentedBg);
	border-radius: 12px;
	padding: 16px;
	text-align: center;
}
</style>
