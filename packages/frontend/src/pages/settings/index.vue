<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :tabs="headerTabs" :actions="headerActions">
	<div class="_spacer" style="--MI_SPACER-w: 900px; --MI_SPACER-min: 20px; --MI_SPACER-max: 32px;">
		<div ref="el" class="vvcocwet" :class="{ wide: !narrow }">
			<div class="body">
				<div v-if="!narrow || currentPage?.route.name == null" class="nav">
					<div class="_gaps_s">
						<MkInfo v-if="emailNotConfigured" warn class="info">{{ $locale.env.emailNotConfiguredWarning }} <MkA to="/settings/email" class="_link">{{ $locale.env.configure }}</MkA></MkInfo>
						<MkInfo v-if="storagePersistenceSupported && !storagePersisted && store.r.showStoragePersistenceSuggestion.value" class="info">
							<div>{{ $locale.env._settings.settingsPersistence_description1 }}</div>
							<div>{{ $locale.env._settings.settingsPersistence_description2 }}</div>
							<div><button class="_textButton" @click="enableStoragePersistence">{{ $locale.env.enable }}</button> | <button class="_textButton" @click="skipStoragePersistence">{{ $locale.env.skip }}</button></div>
						</MkInfo>
						<MkInfo v-if="!store.r.enablePreferencesAutoCloudBackup.value && store.r.showPreferencesAutoCloudBackupSuggestion.value" class="info">
							<div>{{ $locale.env._preferencesBackup.autoPreferencesBackupIsNotEnabledForThisDevice }}</div>
							<div><button class="_textButton" @click="enableAutoBackup">{{ $locale.env.enable }}</button> | <button class="_textButton" @click="skipAutoBackup">{{ $locale.env.skip }}</button></div>
						</MkInfo>
						<MkSuperMenu :def="menuDef" :grid="narrow" :searchIndex="searchIndex"></MkSuperMenu>
					</div>
				</div>
				<div v-if="!(narrow && currentPage?.route.name == null)" class="main">
					<div style="container-type: inline-size;">
						<NestedRouterView/>
					</div>
				</div>
			</div>
		</div>
	</div>
</PageWithHeader>
</template>

<script setup lang="ts">
import { useLocale } from 'virtual:vite-vue-internationalization';

import { computed, onActivated, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';
import type { PageMetadata } from '@/page.js';
import type { SuperMenuDef } from '@/components/MkSuperMenu.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkSuperMenu from '@/components/MkSuperMenu.vue';
import { $i } from '@/i.js';
import { clearCache } from '@/utility/clear-cache.js';
import { instance } from '@/instance.js';
import { definePage, provideMetadataReceiver, provideReactiveMetadata } from '@/page.js';
import * as os from '@/os.js';
import { useRouter } from '@/router.js';
import { enableAutoBackup, getPreferencesProfileMenu } from '@/preferences/utility.js';
import { store } from '@/store.js';
import { signout } from '@/signout.js';
import { genSearchIndexes } from '@/utility/inapp-search.js';
import { enableStoragePersistence, getStoragePersistenceStatusRef, storagePersistenceSupported, skipStoragePersistence } from '@/utility/storage.js';
const localeRef = useLocale(import.meta.url);

const searchIndex = await import('search-index:settings').then(({ searchIndexes }) => genSearchIndexes(searchIndexes));

const storagePersisted = await getStoragePersistenceStatusRef();

const indexInfo = {
	title: localeRef.value.env.settings,
	icon: 'ti ti-settings',
	hideHeader: true,
};
const INFO = ref<PageMetadata>(indexInfo);
const el = useTemplateRef('el');
const childInfo = ref<null | PageMetadata>(null);

const router = useRouter();

const narrow = ref(false);
const NARROW_THRESHOLD = 600;

const currentPage = computed(() => router.currentRef.value.child);

const ro = new ResizeObserver((entries, observer) => {
	if (entries.length === 0) return;
	narrow.value = entries[0].borderBoxSize[0].inlineSize < NARROW_THRESHOLD;
});

function skipAutoBackup() {
	store.set('showPreferencesAutoCloudBackupSuggestion', false);
}

const menuDef = computed<SuperMenuDef[]>(() => [{
	items: [{
		icon: 'ti ti-user',
		text: localeRef.value.env.profile,
		to: '/settings/profile',
		active: currentPage.value?.route.name === 'profile',
	}, {
		icon: 'ti ti-lock-open',
		text: localeRef.value.env.privacy,
		to: '/settings/privacy',
		active: currentPage.value?.route.name === 'privacy',
	}, {
		icon: 'ti ti-bell',
		text: localeRef.value.env.notifications,
		to: '/settings/notifications',
		active: currentPage.value?.route.name === 'notifications',
	}, {
		icon: 'ti ti-mail',
		text: localeRef.value.env.email,
		to: '/settings/email',
		active: currentPage.value?.route.name === 'email',
	}, {
		icon: 'ti ti-lock',
		text: localeRef.value.env.security,
		to: '/settings/security',
		active: currentPage.value?.route.name === 'security',
	}],
}, {
	items: [{
		icon: 'ti ti-adjustments',
		text: localeRef.value.env.preferences,
		to: '/settings/preferences',
		active: currentPage.value?.route.name === 'preferences',
	}, {
		icon: 'ti ti-palette',
		text: localeRef.value.env.theme,
		to: '/settings/theme',
		active: currentPage.value?.route.name === 'theme',
	}, {
		icon: 'ti ti-mood-happy',
		text: localeRef.value.env.emojiPalette,
		to: '/settings/emoji-palette',
		active: currentPage.value?.route.name === 'emoji-palette',
	}, {
		icon: 'ti ti-music',
		text: localeRef.value.env.sounds,
		to: '/settings/sounds',
		active: currentPage.value?.route.name === 'sounds',
	}, {
		icon: 'ti ti-plug',
		text: localeRef.value.env.plugins,
		to: '/settings/plugin',
		active: currentPage.value?.route.name === 'plugin',
	}],
}, {
	items: [{
		icon: 'ti ti-cloud',
		text: localeRef.value.env.drive,
		to: '/settings/drive',
		active: currentPage.value?.route.name === 'drive',
	}, {
		icon: 'ti ti-ban',
		text: localeRef.value.env.muteAndBlock,
		to: '/settings/mute-block',
		active: currentPage.value?.route.name === 'mute-block',
	}, {
		icon: 'ti ti-link',
		text: localeRef.value.env._settings.serviceConnection,
		to: '/settings/connect',
		active: currentPage.value?.route.name === 'connect',
	}, {
		icon: 'ti ti-package',
		text: localeRef.value.env._settings.accountData,
		to: '/settings/account-data',
		active: currentPage.value?.route.name === 'account-data',
	}, {
		icon: 'ti ti-dots',
		text: localeRef.value.env.other,
		to: '/settings/other',
		active: currentPage.value?.route.name === 'other',
	}],
}, {
	items: [{
		type: 'button',
		icon: 'ti ti-settings-2',
		text: localeRef.value.env.preferencesProfile,
		action: async (ev) => {
			os.popupMenu(getPreferencesProfileMenu(), ev.currentTarget ?? ev.target);
		},
	}, {
		type: 'button',
		icon: 'ti ti-trash',
		text: localeRef.value.env.clearCache,
		action: async () => {
			await clearCache();
		},
	}, {
		type: 'button',
		icon: 'ti ti-power',
		text: localeRef.value.env.logout,
		action: async () => {
			const { canceled } = await os.confirm({
				type: 'warning',
				title: localeRef.value.env.logoutConfirm,
				text: localeRef.value.env.logoutWillClearClientData,
			});
			if (canceled) return;
			signout();
		},
		danger: true,
	}],
}]);

onMounted(() => {
	if (el.value == null) return; // TSを黙らすため

	ro.observe(el.value);

	narrow.value = el.value.offsetWidth < NARROW_THRESHOLD;

	if (!narrow.value && currentPage.value?.route.name == null) {
		router.replace('/settings/profile');
	}
});

onActivated(() => {
	if (el.value == null) return; // TSを黙らすため

	narrow.value = el.value.offsetWidth < NARROW_THRESHOLD;

	if (!narrow.value && currentPage.value?.route.name == null) {
		router.replace('/settings/profile');
	}
});

onUnmounted(() => {
	ro.disconnect();
});

watch(router.currentRef, (to) => {
	if (to.route.name === 'settings' && to.child?.route.name == null && !narrow.value) {
		router.replace('/settings/profile');
	}
});

const emailNotConfigured = computed(() => $i && instance.enableEmail && ($i.email == null || !$i.emailVerified));

provideMetadataReceiver((metadataGetter) => {
	const info = metadataGetter();
	if (info == null) {
		childInfo.value = null;
	} else {
		childInfo.value = info;
		INFO.value.needWideArea = info.needWideArea ?? undefined;
	}
});
provideReactiveMetadata(INFO);

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => INFO.value);
// w 890
// h 700
</script>

<style lang="scss" scoped>
.vvcocwet {
	&.wide {
		> .body {
			display: flex;
			height: 100%;

			> .nav {
				width: 34%;
				padding-right: 32px;
				box-sizing: border-box;
			}

			> .main {
				flex: 1;
				min-width: 0;
			}
		}
	}
}
</style>
