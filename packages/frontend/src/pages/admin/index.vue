<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div ref="el" class="hiyeyicy" :class="{ wide: !narrow }">
	<div v-if="!narrow || currentPage?.route.name == null" class="nav">
		<div class="_spacer" style="--MI_SPACER-w: 700px; --MI_SPACER-min: 16px;">
			<div class="lxpfedzu _gaps">
				<div class="banner">
					<img :src="instance.iconUrl || '/favicon.ico'" alt="" class="icon"/>
				</div>

				<div class="_gaps_s">
					<MkInfo v-if="thereIsUnresolvedAbuseReport" warn>{{ $locale.env.thereIsUnresolvedAbuseReportWarning }} <MkA to="/admin/abuses" class="_link">{{ $locale.env.check }}</MkA></MkInfo>
					<MkInfo v-if="noMaintainerInformation" warn>{{ $locale.env.noMaintainerInformationWarning }} <MkA to="/admin/settings" class="_link">{{ $locale.env.configure }}</MkA></MkInfo>
					<MkInfo v-if="noInquiryUrl" warn>{{ $locale.env.noInquiryUrlWarning }} <MkA to="/admin/settings" class="_link">{{ $locale.env.configure }}</MkA></MkInfo>
					<MkInfo v-if="noBotProtection" warn>{{ $locale.env.noBotProtectionWarning }} <MkA to="/admin/security" class="_link">{{ $locale.env.configure }}</MkA></MkInfo>
					<MkInfo v-if="noEmailServer" warn>{{ $locale.env.noEmailServerWarning }} <MkA to="/admin/email-settings" class="_link">{{ $locale.env.configure }}</MkA></MkInfo>
				</div>

				<MkSuperMenu :def="menuDef" :searchIndex="searchIndex" :grid="narrow"></MkSuperMenu>
			</div>
		</div>
	</div>
	<div v-if="!(narrow && currentPage?.route.name == null)" class="main _pageContainer" style="height: 100%;">
		<NestedRouterView/>
	</div>
</div>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { onActivated, onMounted, onUnmounted, provide, watch, ref, computed } from 'vue';
import type { SuperMenuDef } from '@/components/MkSuperMenu.vue';
import type { PageMetadata } from '@/page.js';
import MkSuperMenu from '@/components/MkSuperMenu.vue';
import MkInfo from '@/components/MkInfo.vue';
import { instance } from '@/instance.js';
import { lookup } from '@/utility/lookup.js';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { lookupUser, lookupUserByEmail, lookupFile } from '@/utility/admin-lookup.js';
import { definePage, provideMetadataReceiver, provideReactiveMetadata } from '@/page.js';
import { useRouter } from '@/router.js';
import { genSearchIndexes } from '@/utility/inapp-search.js';
const localeRef = useLocale(import.meta.url);

const searchIndex = await import('search-index:admin').then(({ searchIndexes }) => genSearchIndexes(searchIndexes));

const isEmpty = (x: string | null) => x == null || x === '';

const router = useRouter();

const indexInfo = {
	title: localeRef.value.env.controlPanel,
	icon: 'ti ti-settings',
	hideHeader: true,
};

provide('shouldOmitHeaderTitle', false);

const INFO = ref<PageMetadata>(indexInfo);
const childInfo = ref<null | PageMetadata>(null);
const narrow = ref(false);
const view = ref(null);
const el = ref<HTMLDivElement | null>(null);
const pageProps = ref({});
const noMaintainerInformation = computed(() => isEmpty(instance.maintainerName) || isEmpty(instance.maintainerEmail));
const noBotProtection = computed(() => !instance.disableRegistration && !instance.enableHcaptcha && !instance.enableRecaptcha && !instance.enableTurnstile && !instance.enableMcaptcha);
const noEmailServer = computed(() => !instance.enableEmail);
const noInquiryUrl = computed(() => isEmpty(instance.inquiryUrl));
const thereIsUnresolvedAbuseReport = ref(false);
const currentPage = computed(() => router.currentRef.value.child);

misskeyApi('admin/abuse-user-reports', {
	state: 'unresolved',
	limit: 1,
}).then(reports => {
	if (reports.length > 0) thereIsUnresolvedAbuseReport.value = true;
});

const NARROW_THRESHOLD = 600;
const ro = new ResizeObserver((entries, observer) => {
	if (entries.length === 0) return;
	narrow.value = entries[0].borderBoxSize[0].inlineSize < NARROW_THRESHOLD;
});

const menuDef = computed<SuperMenuDef[]>(() => [{
	title: localeRef.value.env.quickAction,
	items: [{
		type: 'button',
		icon: 'ti ti-search',
		text: localeRef.value.env.lookup,
		action: adminLookup,
	}, ...(instance.disableRegistration ? [{
		type: 'button' as const,
		icon: 'ti ti-user-plus',
		text: localeRef.value.env.createInviteCode,
		action: invite,
	}] : [])],
}, {
	title: localeRef.value.env.administration,
	items: [{
		icon: 'ti ti-dashboard',
		text: localeRef.value.env.dashboard,
		to: '/admin/overview',
		active: currentPage.value?.route.name === 'overview',
	}, {
		icon: 'ti ti-users',
		text: localeRef.value.env.users,
		to: '/admin/users',
		active: currentPage.value?.route.name === 'users',
	}, {
		icon: 'ti ti-user-plus',
		text: localeRef.value.env.invite,
		to: '/admin/invites',
		active: currentPage.value?.route.name === 'invites',
	}, {
		icon: 'ti ti-badges',
		text: localeRef.value.env.roles,
		to: '/admin/roles',
		active: currentPage.value?.route.name === 'roles',
	}, {
		icon: 'ti ti-icons',
		text: localeRef.value.env.customEmojis,
		to: '/admin/emojis',
		active: currentPage.value?.route.name === 'emojis',
	}, {
		icon: 'ti ti-icons',
		text: localeRef.value.env.customEmojis + '(beta)',
		to: '/admin/emojis2',
		active: currentPage.value?.route.name === 'emojis2',
	}, {
		icon: 'ti ti-sparkles',
		text: localeRef.value.env.avatarDecorations,
		to: '/admin/avatar-decorations',
		active: currentPage.value?.route.name === 'avatarDecorations',
	}, {
		icon: 'ti ti-whirl',
		text: localeRef.value.env.federation,
		to: '/admin/federation',
		active: currentPage.value?.route.name === 'federation',
	}, {
		icon: 'ti ti-clock-play',
		text: localeRef.value.env.federationJobs,
		to: '/admin/federation-job-queue',
		active: currentPage.value?.route.name === 'federationJobQueue',
	}, {
		icon: 'ti ti-clock-play',
		text: localeRef.value.env.jobQueue,
		to: '/admin/job-queue',
		active: currentPage.value?.route.name === 'jobQueue',
	}, {
		icon: 'ti ti-cloud',
		text: localeRef.value.env.files,
		to: '/admin/files',
		active: currentPage.value?.route.name === 'files',
	}, {
		icon: 'ti ti-speakerphone',
		text: localeRef.value.env.announcements,
		to: '/admin/announcements',
		active: currentPage.value?.route.name === 'announcements',
	}, {
		icon: 'ti ti-ad',
		text: localeRef.value.env.ads,
		to: '/admin/ads',
		active: currentPage.value?.route.name === 'ads',
	}, {
		icon: 'ti ti-exclamation-circle',
		text: localeRef.value.env.abuseReports,
		to: '/admin/abuses',
		active: currentPage.value?.route.name === 'abuses',
	}, {
		icon: 'ti ti-list-search',
		text: localeRef.value.env.moderationLogs,
		to: '/admin/modlog',
		active: currentPage.value?.route.name === 'modlog',
	}],
}, {
	title: localeRef.value.env.settings,
	items: [{
		icon: 'ti ti-settings',
		text: localeRef.value.env.general,
		to: '/admin/settings',
		active: currentPage.value?.route.name === 'settings',
	}, {
		icon: 'ti ti-paint',
		text: localeRef.value.env.branding,
		to: '/admin/branding',
		active: currentPage.value?.route.name === 'branding',
	}, {
		icon: 'ti ti-shield',
		text: localeRef.value.env.moderation,
		to: '/admin/moderation',
		active: currentPage.value?.route.name === 'moderation',
	}, {
		icon: 'ti ti-mail',
		text: localeRef.value.env.emailServer,
		to: '/admin/email-settings',
		active: currentPage.value?.route.name === 'email-settings',
	}, {
		icon: 'ti ti-cloud',
		text: localeRef.value.env.objectStorage,
		to: '/admin/object-storage',
		active: currentPage.value?.route.name === 'object-storage',
	}, {
		icon: 'ti ti-lock',
		text: localeRef.value.env.security,
		to: '/admin/security',
		active: currentPage.value?.route.name === 'security',
	}, {
		icon: 'ti ti-planet',
		text: localeRef.value.env.relays,
		to: '/admin/relays',
		active: currentPage.value?.route.name === 'relays',
	}, {
		icon: 'ti ti-link',
		text: localeRef.value.env.externalServices,
		to: '/admin/external-services',
		active: currentPage.value?.route.name === 'external-services',
	}, {
		icon: 'ti ti-webhook',
		text: 'Webhook',
		to: '/admin/system-webhook',
		active: currentPage.value?.route.name === 'system-webhook',
	}, {
		icon: 'ti ti-bolt',
		text: localeRef.value.env.performance,
		to: '/admin/performance',
		active: currentPage.value?.route.name === 'performance',
	}],
}, {
	title: localeRef.value.env.info,
	items: [{
		icon: 'ti ti-database',
		text: localeRef.value.env.database,
		to: '/admin/database',
		active: currentPage.value?.route.name === 'database',
	}],
}]);

onMounted(() => {
	if (el.value != null) {
		ro.observe(el.value);
		narrow.value = el.value.offsetWidth < NARROW_THRESHOLD;
	}
	if (currentPage.value?.route.name == null && !narrow.value) {
		router.replace('/admin/overview');
	}
});

onActivated(() => {
	if (el.value != null) {
		narrow.value = el.value.offsetWidth < NARROW_THRESHOLD;
	}
	if (currentPage.value?.route.name == null && !narrow.value) {
		router.replace('/admin/overview');
	}
});

onUnmounted(() => {
	ro.disconnect();
});

watch(router.currentRef, (to) => {
	if (to.route.path === '/admin' && to.child?.route.name == null && !narrow.value) {
		router.replace('/admin/overview');
	}
});

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

function invite() {
	misskeyApi('admin/invite/create').then(x => {
		os.alert({
			type: 'info',
			text: x[0].code,
		});
	}).catch(err => {
		os.alert({
			type: 'error',
			text: err,
		});
	});
}

function adminLookup(ev: PointerEvent) {
	os.popupMenu([{
		text: localeRef.value.env.user,
		icon: 'ti ti-user',
		action: () => {
			lookupUser();
		},
	}, {
		text: `${localeRef.value.env.user} (${localeRef.value.env.email})`,
		icon: 'ti ti-user',
		action: () => {
			lookupUserByEmail();
		},
	}, {
		text: localeRef.value.env.file,
		icon: 'ti ti-cloud',
		action: () => {
			lookupFile();
		},
	}, {
		text: localeRef.value.env.lookup,
		icon: 'ti ti-world-search',
		action: () => {
			lookup();
		},
	}], ev.currentTarget ?? ev.target);
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => INFO.value);
</script>

<style lang="scss" scoped>
.hiyeyicy {
	height: 100%;

	&.wide {
		display: flex;
		margin: 0 auto;

		> .nav {
			position: sticky;
			top: 0;
			width: 32%;
			max-width: 280px;
			box-sizing: border-box;
			border-right: solid 0.5px var(--MI_THEME-divider);
			overflow: auto;
			height: 100cqh;
		}

		> .main {
			flex: 1;
			min-width: 0;
		}
	}

	> .nav {
		.lxpfedzu {
			> .banner {
				margin: 16px;

				> .icon {
					display: block;
					margin: auto;
					height: 42px;
					border-radius: 8px;
				}
			}
		}
	}
}
</style>
