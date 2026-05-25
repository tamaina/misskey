<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<SearchMarker path="/settings/notifications" :label="$locale.env.notifications" :keywords="['notifications']" icon="ti ti-bell">
	<div class="_gaps_m">
		<MkFeatureBanner icon="/client-assets/bell_3d.png" color="#ffff00">
			<SearchText>{{ $locale.env._settings.notificationsBanner }}</SearchText>
		</MkFeatureBanner>

		<FormSection first>
			<template #label>{{ $locale.env.notificationRecieveConfig }}</template>
			<div class="_gaps_s">
				<MkFolder v-for="type in configurableNotificationTypes" :key="type">
					<template #label>{{ $locale.env._notification._types[type] }}</template>
					<template #suffix>
						{{
							$i.notificationRecieveConfig[type as (typeof configurableNotificationTypes)[number]]?.type === 'never' ? $locale.env.none :
							$i.notificationRecieveConfig[type as (typeof configurableNotificationTypes)[number]]?.type === 'following' ? $locale.env.following :
							$i.notificationRecieveConfig[type as (typeof configurableNotificationTypes)[number]]?.type === 'follower' ? $locale.env.followers :
							$i.notificationRecieveConfig[type as (typeof configurableNotificationTypes)[number]]?.type === 'mutualFollow' ? $locale.env.mutualFollow :
							$i.notificationRecieveConfig[type as (typeof configurableNotificationTypes)[number]]?.type === 'followingOrFollower' ? $locale.env.followingOrFollower :
							$i.notificationRecieveConfig[type as (typeof configurableNotificationTypes)[number]]?.type === 'list' ? $locale.env.userList :
							$locale.env.all
						}}
					</template>

					<XNotificationConfig
						:userLists="userLists"
						:value="$i.notificationRecieveConfig[type] ?? { type: 'all' }"
						:configurableTypes="(onlyOnOrOffNotificationTypes as string[]).includes(type) ? ['all', 'never'] : undefined"
						@update="(res) => updateReceiveConfig(type, res)"
					/>
				</MkFolder>
			</div>
		</FormSection>

		<FormSection>
			<SearchMarker
				:keywords="['notify', 'hide', 'user']"
			>
				<MkFolder>
					<template #label><SearchLabel>{{ $locale.env.notifyUsers }}</SearchLabel></template>
					<MkPagination v-slot="{items}" :paginator="notifyUserPaginator" withControl>
						<div class="_gaps_s">
							<div v-for="item in items" :key="item.id" :class="[$style.userItem ]">
								<div :class="$style.userItemMain">
									<MkA :class="$style.userItemMainBody" :to="userPage(item.followee!)">
										<MkUserCardMini :user="item.followee!"/>
									</MkA>
									<button class="_button" :class="$style.notifyMenu" @click="showNotifyMenu(item.followee!, $event)"><i class="ti ti-dots"></i></button>
								</div>
							</div>
						</div>
					</MkPagination>
				</MkFolder>
			</SearchMarker>
		</FormSection>
		<FormSection>
			<div class="_gaps_m">
				<FormLink to="/settings/sounds">{{ $locale.env.notificationSoundSettings }}</FormLink>
			</div>
		</FormSection>
		<FormSection>
			<div class="_gaps_s">
				<MkButton @click="readAllNotifications">{{ $locale.env.markAsReadAllNotifications }}</MkButton>
				<MkButton @click="testNotification">{{ $locale.env._notification.sendTestNotification }}</MkButton>
				<MkButton @click="flushNotification">{{ $locale.env._notification.flushNotification }}</MkButton>
			</div>
		</FormSection>
		<FormSection>
			<template #label>{{ $locale.env.pushNotification }}</template>

			<div class="_gaps_m">
				<MkPushNotificationAllowButton ref="allowButton"/>
				<MkSwitch :disabled="!pushRegistrationInServer" :modelValue="sendReadMessage" @update:modelValue="onChangeSendReadMessage">
					<template #label>{{ $locale.env.sendPushNotificationReadMessage }}</template>
					<template #caption>{{ $locale.env.sendPushNotificationReadMessageCaption }}</template>
				</MkSwitch>
			</div>
		</FormSection>
	</div>
</SearchMarker>
</template>

<script lang="ts" setup>
import { $locale as localeRef } from '@/i18n.js';

import { useTemplateRef, computed, ref, markRaw } from 'vue';
import { notificationTypes } from 'misskey-js';
import * as Misskey from 'misskey-js';
import XNotificationConfig from './notifications.notification-config.vue';
import type { NotificationConfig } from './notifications.notification-config.vue';
import FormLink from '@/components/form/link.vue';
import FormSection from '@/components/form/section.vue';
import MkFolder from '@/components/MkFolder.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os.js';
import { ensureSignin } from '@/i.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { definePage } from '@/page.js';
import MkPushNotificationAllowButton from '@/components/MkPushNotificationAllowButton.vue';
import MkFeatureBanner from '@/components/MkFeatureBanner.vue';
import { Paginator } from '@/utility/paginator.js';
import MkPagination from '@/components/MkPagination.vue';
import { userPage } from '@/filters/user.js';
import MkUserCardMini from '@/components/MkUserCardMini.vue';

const $i = ensureSignin();

async function showNotifyMenu(user: Misskey.entities.UserDetailed, ev: PointerEvent) {
	os.popupMenu([{
		text: (user.notify === 'normal') ? localeRef.value.env.unnotifyNotes : localeRef.value.env.notifyNotes,
		icon: (user.notify === 'normal') ? 'ti ti-x' : 'ti ti-plus',
		action: async () => {
			await os.apiWithDialog('following/update', {
				userId: user.id,
				notify: user.notify === 'normal' ? 'none' : 'normal',
			}).then(() => {
				user.notify = user.notify === 'normal' ? 'none' : 'normal';
			});
		},
	}], ev.currentTarget ?? ev.target);
}

const notifyUserPaginator = markRaw(new Paginator('following/list', {
	limit: 10,
	params: {
		notification: true,
	},
}));

const nonConfigurableNotificationTypes = ['note', 'roleAssigned', 'followRequestAccepted', 'test', 'exportCompleted'] as const satisfies (typeof notificationTypes[number])[];

const configurableNotificationTypes = notificationTypes.filter(type => !nonConfigurableNotificationTypes.includes(type as any)) as Exclude<typeof notificationTypes[number], typeof nonConfigurableNotificationTypes[number]>[];

const onlyOnOrOffNotificationTypes = ['app', 'achievementEarned', 'login', 'createToken', 'scheduledNotePosted', 'scheduledNotePostFailed'] as const satisfies (typeof notificationTypes[number])[];

const allowButton = useTemplateRef('allowButton');
const pushRegistrationInServer = computed(() => allowButton.value?.pushRegistrationInServer);
const sendReadMessage = computed(() => pushRegistrationInServer.value?.sendReadMessage || false);
const userLists = await misskeyApi('users/lists/list');

async function readAllNotifications() {
	await os.apiWithDialog('notifications/mark-all-as-read', {});
}

async function updateReceiveConfig(type: typeof notificationTypes[number], value: NotificationConfig) {
	await os.apiWithDialog('i/update', {
		notificationRecieveConfig: {
			...$i.notificationRecieveConfig,
			[type]: value,
		},
	}).then(i => {
		$i.notificationRecieveConfig = i.notificationRecieveConfig;
	});
}

function onChangeSendReadMessage(v: boolean) {
	if (!pushRegistrationInServer.value) return;

	os.apiWithDialog('sw/update-registration', {
		endpoint: pushRegistrationInServer.value.endpoint,
		sendReadMessage: v,
	}).then(res => {
		if (!allowButton.value)	return;
		allowButton.value.pushRegistrationInServer = res;
	});
}

function testNotification(): void {
	misskeyApi('notifications/test-notification');
}

async function flushNotification() {
	const { canceled } = await os.confirm({
		type: 'warning',
		text: localeRef.value.env.resetAreYouSure,
	});

	if (canceled) return;

	os.apiWithDialog('notifications/flush', {});
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env.notifications,
	icon: 'ti ti-bell',
}));
</script>

<style lang="scss" module>
.userItemMain {
	display: flex;
}

.userItemMainBody {
	flex: 1;
	min-width: 0;
	margin-right: 8px;

	&:hover {
		text-decoration: none;
	}
}

.notifyMenu {
	width: 32px;
	height: 32px;
	align-self: center;
}
</style>
