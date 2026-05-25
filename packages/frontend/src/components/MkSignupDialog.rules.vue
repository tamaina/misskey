<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div>
	<div :class="$style.banner">
		<i class="ti ti-checklist"></i>
	</div>
	<div class="_spacer" style="--MI_SPACER-min: 20px; --MI_SPACER-max: 28px;">
		<div class="_gaps_m">
			<div v-if="instance.disableRegistration || instance.federation !== 'all'" class="_gaps_s">
				<MkInfo v-if="instance.disableRegistration" warn>{{ $locale.env.invitationRequiredToRegister }}</MkInfo>
				<MkInfo v-if="instance.federation === 'specified'" warn>{{ $locale.env.federationSpecified }}</MkInfo>
				<MkInfo v-else-if="instance.federation === 'none'" warn>{{ $locale.env.federationDisabled }}</MkInfo>
			</div>

			<div style="text-align: center;">
				<div>{{ $locale.env.pleaseConfirmBelowBeforeSignup }}</div>
				<div style="font-weight: bold; margin-top: 0.5em;">{{ $locale.env.beSureToReadThisAsItIsImportant }}</div>
			</div>

			<MkFolder v-if="availableServerRules" :defaultOpen="true">
				<template #label>{{ $locale.env.serverRules }}</template>
				<template #suffix><i v-if="agreeServerRules" class="ti ti-check" style="color: var(--MI_THEME-success)"></i></template>

				<ol class="_gaps_s" :class="$style.rules">
					<li v-for="item in instance.serverRules" :class="$style.rule"><div :class="$style.ruleText" v-html="item"></div></li>
				</ol>

				<MkSwitch :modelValue="agreeServerRules" style="margin-top: 16px;" @update:modelValue="updateAgreeServerRules">{{ $locale.env.agree }}</MkSwitch>
			</MkFolder>

			<MkFolder v-if="availableTos || availablePrivacyPolicy" :defaultOpen="true">
				<template #label>{{ tosPrivacyPolicyLabel }}</template>
				<template #suffix><i v-if="agreeTosAndPrivacyPolicy" class="ti ti-check" style="color: var(--MI_THEME-success)"></i></template>
				<div class="_gaps_s">
					<div v-if="availableTos"><a :href="instance.tosUrl ?? undefined" class="_link" target="_blank">{{ $locale.env.termsOfService }} <i class="ti ti-external-link"></i></a></div>
					<div v-if="availablePrivacyPolicy"><a :href="instance.privacyPolicyUrl ?? undefined" class="_link" target="_blank">{{ $locale.env.privacyPolicy }} <i class="ti ti-external-link"></i></a></div>
				</div>

				<MkSwitch :modelValue="agreeTosAndPrivacyPolicy" style="margin-top: 16px;" @update:modelValue="updateAgreeTosAndPrivacyPolicy">{{ $locale.env.agree }}</MkSwitch>
			</MkFolder>

			<MkFolder :defaultOpen="true">
				<template #label>{{ $locale.env.basicNotesBeforeCreateAccount }}</template>
				<template #suffix><i v-if="agreeNote" class="ti ti-check" style="color: var(--MI_THEME-success)"></i></template>

				<a href="https://misskey-hub.net/docs/for-users/onboarding/warning/" class="_link" target="_blank">{{ $locale.env.basicNotesBeforeCreateAccount }} <i class="ti ti-external-link"></i></a>

				<MkSwitch :modelValue="agreeNote" style="margin-top: 16px;" data-cy-signup-rules-notes-agree @update:modelValue="updateAgreeNote">{{ $locale.env.agree }}</MkSwitch>
			</MkFolder>

			<div v-if="!agreed" style="text-align: center;">{{ $locale.env.pleaseAgreeAllToContinue }}</div>

			<div class="_buttonsCenter">
				<MkButton inline rounded @click="emit('cancel')">{{ $locale.env.cancel }}</MkButton>
				<MkButton inline primary rounded gradate :disabled="!agreed" data-cy-signup-rules-continue @click="emit('done')">{{ $locale.env.continue }} <i class="ti ti-arrow-right"></i></MkButton>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { $locale as localeRef, $l as localizerRef } from '@/i18n.js';

import { computed, ref } from 'vue';
import { instance } from '@/instance.js';
import MkButton from '@/components/MkButton.vue';
import MkFolder from '@/components/MkFolder.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkInfo from '@/components/MkInfo.vue';
import * as os from '@/os.js';

const availableServerRules = instance.serverRules.length > 0;
const availableTos = instance.tosUrl != null && instance.tosUrl !== '';
const availablePrivacyPolicy = instance.privacyPolicyUrl != null && instance.privacyPolicyUrl !== '';

const agreeServerRules = ref(false);
const agreeTosAndPrivacyPolicy = ref(false);
const agreeNote = ref(false);

const agreed = computed(() => {
	return (!availableServerRules || agreeServerRules.value) && ((!availableTos && !availablePrivacyPolicy) || agreeTosAndPrivacyPolicy.value) && agreeNote.value;
});

const emit = defineEmits<{
	(ev: 'cancel'): void;
	(ev: 'done'): void;
}>();

const tosPrivacyPolicyLabel = computed(() => {
	if (availableTos && availablePrivacyPolicy) {
		return localeRef.value.env.tosAndPrivacyPolicy;
	} else if (availableTos) {
		return localeRef.value.env.termsOfService;
	} else if (availablePrivacyPolicy) {
		return localeRef.value.env.privacyPolicy;
	} else {
		return '';
	}
});

async function updateAgreeServerRules(v: boolean) {
	if (v) {
		const confirm = await os.confirm({
			type: 'question',
			title: localeRef.value.env.doYouAgree,
			text: localizerRef.value.env.iHaveReadXCarefullyAndAgree({ x: localeRef.value.env.serverRules }),
		});
		if (confirm.canceled) return;
		agreeServerRules.value = true;
	} else {
		agreeServerRules.value = false;
	}
}

async function updateAgreeTosAndPrivacyPolicy(v: boolean) {
	if (v) {
		const confirm = await os.confirm({
			type: 'question',
			title: localeRef.value.env.doYouAgree,
			text: localizerRef.value.env.iHaveReadXCarefullyAndAgree({
				x: tosPrivacyPolicyLabel.value,
			}),
		});
		if (confirm.canceled) return;
		agreeTosAndPrivacyPolicy.value = true;
	} else {
		agreeTosAndPrivacyPolicy.value = false;
	}
}

async function updateAgreeNote(v: boolean) {
	if (v) {
		const confirm = await os.confirm({
			type: 'question',
			title: localeRef.value.env.doYouAgree,
			text: localizerRef.value.env.iHaveReadXCarefullyAndAgree({ x: localeRef.value.env.basicNotesBeforeCreateAccount }),
		});
		if (confirm.canceled) return;
		agreeNote.value = true;
	} else {
		agreeNote.value = false;
	}
}
</script>

<style lang="scss" module>
.banner {
	padding: 16px;
	text-align: center;
	font-size: 26px;
	background-color: var(--MI_THEME-accentedBg);
	color: var(--MI_THEME-accent);
}

.rules {
	counter-reset: item;
	list-style: none;
	padding: 0;
	margin: 0;
}

.rule {
	display: flex;
	gap: 8px;
	word-break: break-word;

	&::before {
		flex-shrink: 0;
		display: flex;
		position: sticky;
		top: calc(var(--MI-stickyTop, 0px) + 8px);
		counter-increment: item;
		content: counter(item);
		width: 32px;
		height: 32px;
		line-height: 32px;
		background-color: var(--MI_THEME-accentedBg);
		color: var(--MI_THEME-accent);
		font-size: 13px;
		font-weight: bold;
		align-items: center;
		justify-content: center;
		border-radius: 999px;
	}
}

.ruleText {
	padding-top: 6px;
}
</style>
