<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<SearchMarker path="/settings/security" :label="$locale.env.security" :keywords="['security']" icon="ti ti-lock" :inlining="['2fa']">
	<div class="_gaps_m">
		<MkFeatureBanner icon="/client-assets/locked_with_key_3d.png" color="#ffbf00">
			<SearchText>{{ $locale.env._settings.securityBanner }}</SearchText>
		</MkFeatureBanner>

		<SearchMarker :keywords="['password']">
			<FormSection first>
				<template #label><SearchLabel>{{ $locale.env.password }}</SearchLabel></template>

				<SearchMarker>
					<MkButton primary @click="change()">
						<SearchLabel>{{ $locale.env.changePassword }}</SearchLabel>
					</MkButton>
				</SearchMarker>
			</FormSection>
		</SearchMarker>

		<X2fa/>

		<SearchMarker :keywords="['signin', 'login', 'history', 'log']">
			<FormSection>
				<template #label><SearchLabel>{{ $locale.env.signinHistory }}</SearchLabel></template>
				<MkPagination :paginator="paginator" withControl :forceDisableInfiniteScroll="true">
					<template #default="{items}">
						<div>
							<div v-for="item in items" :key="item.id" v-panel class="timnmucd">
								<header>
									<i v-if="item.success" class="ti ti-check icon succ"></i>
									<i v-else class="ti ti-circle-x icon fail"></i>
									<code class="ip _monospace">{{ item.ip }}</code>
									<MkTime :time="item.createdAt" class="time"/>
								</header>
							</div>
						</div>
					</template>
				</MkPagination>
			</FormSection>
		</SearchMarker>

		<SearchMarker :keywords="['regenerate', 'refresh', 'reset', 'token']">
			<FormSection>
				<FormSlot>
					<MkButton danger @click="regenerateToken"><i class="ti ti-refresh"></i> <SearchLabel>{{ $locale.env.regenerateLoginToken }}</SearchLabel></MkButton>
					<template #caption>{{ $locale.env.regenerateLoginTokenDescription }}</template>
				</FormSlot>
			</FormSection>
		</SearchMarker>
	</div>
</SearchMarker>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { computed, markRaw } from 'vue';
import X2fa from './2fa.vue';
import FormSection from '@/components/form/section.vue';
import FormSlot from '@/components/form/slot.vue';
import MkButton from '@/components/MkButton.vue';
import MkPagination from '@/components/MkPagination.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { definePage } from '@/page.js';
import MkFeatureBanner from '@/components/MkFeatureBanner.vue';
import { Paginator } from '@/utility/paginator.js';
const localeRef = useLocale(import.meta.url);

const paginator = markRaw(new Paginator('i/signin-history', {
	limit: 5,
}));

async function change() {
	const { canceled: canceled2, result: newPassword } = await os.inputText({
		title: localeRef.value.env.newPassword,
		type: 'password',
		autocomplete: 'new-password',
	});
	if (canceled2 || newPassword == null) return;

	const { canceled: canceled3, result: newPassword2 } = await os.inputText({
		title: localeRef.value.env.newPasswordRetype,
		type: 'password',
		autocomplete: 'new-password',
	});
	if (canceled3 || newPassword2 == null) return;

	if (newPassword !== newPassword2) {
		os.alert({
			type: 'error',
			text: localeRef.value.env.retypedNotMatch,
		});
		return;
	}

	const auth = await os.authenticateDialog();
	if (auth.canceled) return;

	os.apiWithDialog('i/change-password', {
		currentPassword: auth.result.password,
		token: auth.result.token,
		newPassword,
	});
}

async function regenerateToken() {
	const auth = await os.authenticateDialog();
	if (auth.canceled) return;

	misskeyApi('i/regenerate-token', {
		password: auth.result.password,
		token: auth.result.token,
	});
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env.security,
	icon: 'ti ti-lock',
}));
</script>

<style lang="scss" scoped>
.timnmucd {
	padding: 12px;

	&:first-child {
		border-top-left-radius: 6px;
		border-top-right-radius: 6px;
	}

	&:last-child {
		border-bottom-left-radius: 6px;
		border-bottom-right-radius: 6px;
	}

	&:not(:last-child) {
		border-bottom: solid 0.5px var(--MI_THEME-divider);
	}

	> header {
		display: flex;
		align-items: center;

		> .icon {
			width: 1em;
			margin-right: 0.75em;

			&.succ {
				color: var(--MI_THEME-success);
			}

			&.fail {
				color: var(--MI_THEME-error);
			}
		}

		> .ip {
			flex: 1;
			min-width: 0;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			margin-right: 12px;
		}

		> .time {
			margin-left: auto;
			opacity: 0.7;
		}
	}
}
</style>
