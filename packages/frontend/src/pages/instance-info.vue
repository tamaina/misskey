<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs" :swipable="true">
	<div v-if="instance" class="_spacer" style="--MI_SPACER-w: 600px; --MI_SPACER-min: 16px; --MI_SPACER-max: 32px;">
		<div v-if="tab === 'overview'" class="_gaps_m">
			<div :class="$style.faviconAndName">
				<img v-if="faviconUrl" :src="faviconUrl" alt="" :class="$style.icon"/>
				<span :class="$style.name">{{ instance.name || `(${$locale.env.unknown})` }}</span>
			</div>
			<div style="display: flex; flex-direction: column; gap: 1em;">
				<MkKeyValue :copy="host" oneline>
					<template #key>Host</template>
					<template #value><span class="_monospace"><MkLink :url="`https://${host}`">{{ host }}</MkLink></span></template>
				</MkKeyValue>
				<MkKeyValue oneline>
					<template #key>{{ $locale.env.software }}</template>
					<template #value><span class="_monospace">{{ instance.softwareName || `(${$locale.env.unknown})` }} / {{ instance.softwareVersion || `(${$locale.env.unknown})` }}</span></template>
				</MkKeyValue>
				<MkKeyValue oneline>
					<template #key>{{ $locale.env.administrator }}</template>
					<template #value>{{ instance.maintainerName || `(${$locale.env.unknown})` }} ({{ instance.maintainerEmail || `(${$locale.env.unknown})` }})</template>
				</MkKeyValue>
			</div>
			<MkKeyValue>
				<template #key>{{ $locale.env.description }}</template>
				<template #value>{{ instance.description }}</template>
			</MkKeyValue>

			<FormSection v-if="iAmModerator">
				<template #label>Moderation</template>
				<div class="_gaps_s">
					<MkKeyValue>
						<template #key>
							{{ $locale.env._delivery.status }}
						</template>
						<template #value>
							{{ $locale.env._delivery._type[suspensionState] }}
						</template>
					</MkKeyValue>
					<MkButton v-if="suspensionState === 'none'" :disabled="!instance" danger @click="stopDelivery">{{ $locale.env._delivery.stop }}</MkButton>
					<MkButton v-if="suspensionState !== 'none'" :disabled="!instance || suspensionState == 'softwareSuspended'" @click="resumeDelivery">{{ $locale.env._delivery.resume }}</MkButton>
					<MkSwitch v-model="isBlocked" :disabled="!meta || !instance" @update:modelValue="toggleBlock">{{ $locale.env.blockThisInstance }}</MkSwitch>
					<MkSwitch v-model="isSilenced" :disabled="!meta || !instance" @update:modelValue="toggleSilenced">{{ $locale.env.silenceThisInstance }}</MkSwitch>
					<MkSwitch v-model="isMediaSilenced" :disabled="!meta || !instance" @update:modelValue="toggleMediaSilenced">{{ $locale.env.mediaSilenceThisInstance }}</MkSwitch>
					<MkButton @click="refreshMetadata"><i class="ti ti-refresh"></i> Refresh metadata</MkButton>
					<MkTextarea v-model="moderationNote" manualSave>
						<template #label>{{ $locale.env.moderationNote }}</template>
						<template #caption>{{ $locale.env.moderationNoteDescription }}</template>
					</MkTextarea>
				</div>
			</FormSection>

			<FormSection>
				<MkKeyValue oneline style="margin: 1em 0;">
					<template #key>{{ $locale.env.registeredAt }}</template>
					<template #value><MkTime mode="detail" :time="instance.firstRetrievedAt"/></template>
				</MkKeyValue>
				<MkKeyValue oneline style="margin: 1em 0;">
					<template #key>{{ $locale.env.updatedAt }}</template>
					<template #value><MkTime mode="detail" :time="instance.infoUpdatedAt"/></template>
				</MkKeyValue>
				<MkKeyValue oneline style="margin: 1em 0;">
					<template #key>{{ $locale.env.latestRequestReceivedAt }}</template>
					<template #value><MkTime v-if="instance.latestRequestReceivedAt" :time="instance.latestRequestReceivedAt"/><span v-else>N/A</span></template>
				</MkKeyValue>
			</FormSection>

			<FormSection>
				<MkKeyValue oneline style="margin: 1em 0;">
					<template #key>Following (Pub)</template>
					<template #value>{{ number(instance.followingCount) }}</template>
				</MkKeyValue>
				<MkKeyValue oneline style="margin: 1em 0;">
					<template #key>Followers (Sub)</template>
					<template #value>{{ number(instance.followersCount) }}</template>
				</MkKeyValue>
			</FormSection>

			<FormSection>
				<template #label>Well-known resources</template>
				<FormLink :to="`https://${host}/.well-known/host-meta`" external style="margin-bottom: 8px;">host-meta</FormLink>
				<FormLink :to="`https://${host}/.well-known/host-meta.json`" external style="margin-bottom: 8px;">host-meta.json</FormLink>
				<FormLink :to="`https://${host}/.well-known/nodeinfo`" external style="margin-bottom: 8px;">nodeinfo</FormLink>
				<FormLink :to="`https://${host}/robots.txt`" external style="margin-bottom: 8px;">robots.txt</FormLink>
				<FormLink :to="`https://${host}/manifest.json`" external style="margin-bottom: 8px;">manifest.json</FormLink>
			</FormSection>
		</div>
		<div v-else-if="tab === 'chart'" class="_gaps_m">
			<div>
				<div :class="$style.selects">
					<MkSelect v-model="chartSrc" :items="chartSrcDef" style="margin: 0 10px 0 0; flex: 1;">
					</MkSelect>
				</div>
				<div>
					<div :class="$style.label">{{ $l.env.recentNHours({ n: 90 }) }}</div>
					<MkChart :src="chartSrc" span="hour" :limit="90" :args="{ host: host }" :detailed="true"></MkChart>
					<div :class="$style.label">{{ $l.env.recentNDays({ n: 90 }) }}</div>
					<MkChart :src="chartSrc" span="day" :limit="90" :args="{ host: host }" :detailed="true"></MkChart>
				</div>
			</div>
		</div>
		<div v-else-if="tab === 'users'" class="_gaps_m">
			<MkPagination v-slot="{ items }" :paginator="usersPaginator">
				<div :class="$style.users">
					<MkA v-for="user in items" :key="user.id" v-tooltip.mfm="`Last posted: ${user.updatedAt ? dateString(user.updatedAt) : 'unknown'}`" :to="`/admin/user/${user.id}`">
						<MkUserCardMini :user="user"/>
					</MkA>
				</div>
			</MkPagination>
		</div>
		<div v-else-if="tab === 'raw'" class="_gaps_m">
			<MkObjectView tall :value="instance">
			</MkObjectView>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { ref, computed, watch, markRaw } from 'vue';
import * as Misskey from 'misskey-js';
import type { ChartSrc } from '@/components/MkChart.vue';
import MkChart from '@/components/MkChart.vue';
import MkObjectView from '@/components/MkObjectView.vue';
import FormLink from '@/components/form/link.vue';
import MkLink from '@/components/MkLink.vue';
import MkButton from '@/components/MkButton.vue';
import FormSection from '@/components/form/section.vue';
import MkKeyValue from '@/components/MkKeyValue.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import number from '@/filters/number.js';
import { iAmModerator, iAmAdmin } from '@/i.js';
import { definePage } from '@/page.js';
import MkUserCardMini from '@/components/MkUserCardMini.vue';
import MkPagination from '@/components/MkPagination.vue';
import { getProxiedImageUrlNullable } from '@/utility/media-proxy.js';
import { dateString } from '@/filters/date.js';
import { useMkSelect } from '@/composables/use-mkselect.js';
import MkTextarea from '@/components/MkTextarea.vue';
import { Paginator } from '@/utility/paginator.js';
const localeRef = useLocale(import.meta.url);

const props = defineProps<{
	host: string;
}>();

const tab = ref('overview');

const {
	model: chartSrc,
	def: chartSrcDef,
} = useMkSelect({
	items: [
		{ label: localeRef.value.env._instanceCharts.requests, value: 'instance-requests' },
		{ label: localeRef.value.env._instanceCharts.users, value: 'instance-users' },
		{ label: localeRef.value.env._instanceCharts.usersTotal, value: 'instance-users-total' },
		{ label: localeRef.value.env._instanceCharts.notes, value: 'instance-notes' },
		{ label: localeRef.value.env._instanceCharts.notesTotal, value: 'instance-notes-total' },
		{ label: localeRef.value.env._instanceCharts.ff, value: 'instance-ff' },
		{ label: localeRef.value.env._instanceCharts.ffTotal, value: 'instance-ff-total' },
		{ label: localeRef.value.env._instanceCharts.cacheSize, value: 'instance-drive-usage' },
		{ label: localeRef.value.env._instanceCharts.cacheSizeTotal, value: 'instance-drive-usage-total' },
		{ label: localeRef.value.env._instanceCharts.files, value: 'instance-drive-files' },
		{ label: localeRef.value.env._instanceCharts.filesTotal, value: 'instance-drive-files-total' },
	],
	initialValue: 'instance-requests',
});
const meta = ref<Misskey.entities.AdminMetaResponse | null>(null);
const instance = ref<Misskey.entities.FederationInstance | null>(null);
const suspensionState = ref<'none' | 'manuallySuspended' | 'goneSuspended' | 'autoSuspendedForNotResponding' | 'softwareSuspended'>('none');
const isBlocked = ref(false);
const isSilenced = ref(false);
const isMediaSilenced = ref(false);
const faviconUrl = ref<string | null>(null);
const moderationNote = ref('');

const usersPaginator = iAmModerator ? markRaw(new Paginator('admin/show-users', {
	limit: 10,
	params: {
		sort: '+updatedAt',
		state: 'all',
		hostname: props.host,
	},
	offsetMode: true,
})) : markRaw(new Paginator('users', {
	limit: 10,
	params: {
		sort: '+updatedAt',
		state: 'all',
		hostname: props.host,
	},
	offsetMode: true,
}));

if (iAmModerator) {
	watch(moderationNote, async () => {
		if (instance.value == null) return;
		await misskeyApi('admin/federation/update-instance', { host: instance.value.host, moderationNote: moderationNote.value });
	});
}

async function _fetch_(): Promise<void> {
	if (iAmAdmin) {
		meta.value = await misskeyApi('admin/meta');
	}
	instance.value = await misskeyApi('federation/show-instance', {
		host: props.host,
	});
	suspensionState.value = instance.value?.suspensionState ?? 'none';
	isBlocked.value = instance.value?.isBlocked ?? false;
	isSilenced.value = instance.value?.isSilenced ?? false;
	isMediaSilenced.value = instance.value?.isMediaSilenced ?? false;
	faviconUrl.value = getProxiedImageUrlNullable(instance.value?.faviconUrl, 'preview') ?? getProxiedImageUrlNullable(instance.value?.iconUrl, 'preview');
	moderationNote.value = instance.value?.moderationNote ?? '';
}

async function toggleBlock(): Promise<void> {
	if (!iAmAdmin) return;
	if (!meta.value) throw new Error('No meta?');
	if (!instance.value) throw new Error('No instance?');
	const { host } = instance.value;
	await misskeyApi('admin/update-meta', {
		blockedHosts: isBlocked.value ? meta.value.blockedHosts.concat([host]) : meta.value.blockedHosts.filter(x => x !== host),
	});
}

async function toggleSilenced(): Promise<void> {
	if (!iAmAdmin) return;
	if (!meta.value) throw new Error('No meta?');
	if (!instance.value) throw new Error('No instance?');
	const { host } = instance.value;
	const silencedHosts = meta.value.silencedHosts ?? [];
	await misskeyApi('admin/update-meta', {
		silencedHosts: isSilenced.value ? silencedHosts.concat([host]) : silencedHosts.filter(x => x !== host),
	});
}

async function toggleMediaSilenced(): Promise<void> {
	if (!iAmAdmin) return;
	if (!meta.value) throw new Error('No meta?');
	if (!instance.value) throw new Error('No instance?');
	const { host } = instance.value;
	const mediaSilencedHosts = meta.value.mediaSilencedHosts ?? [];
	await misskeyApi('admin/update-meta', {
		mediaSilencedHosts: isMediaSilenced.value ? mediaSilencedHosts.concat([host]) : mediaSilencedHosts.filter(x => x !== host),
	});
}

async function stopDelivery(): Promise<void> {
	if (!iAmModerator) return;
	if (!instance.value) throw new Error('No instance?');
	suspensionState.value = 'manuallySuspended';
	await misskeyApi('admin/federation/update-instance', {
		host: instance.value.host,
		isSuspended: true,
	});
}

async function resumeDelivery(): Promise<void> {
	if (!iAmModerator) return;
	if (!instance.value) throw new Error('No instance?');
	suspensionState.value = 'none';
	await misskeyApi('admin/federation/update-instance', {
		host: instance.value.host,
		isSuspended: false,
	});
}

function refreshMetadata(): void {
	if (!iAmModerator) return;
	if (!instance.value) throw new Error('No instance?');
	misskeyApi('admin/federation/refresh-remote-instance-metadata', {
		host: instance.value.host,
	});
	os.alert({
		text: 'Refresh requested',
	});
}

_fetch_();

const headerActions = computed(() => [{
	text: `https://${props.host}`,
	icon: 'ti ti-external-link',
	handler: () => {
		window.open(`https://${props.host}`, '_blank', 'noopener');
	},
}]);

const headerTabs = computed(() => [{
	key: 'overview',
	title: localeRef.value.env.overview,
	icon: 'ti ti-info-circle',
}, ...(iAmModerator ? [{
	key: 'chart',
	title: localeRef.value.env.charts,
	icon: 'ti ti-chart-line',
}, {
	key: 'users',
	title: localeRef.value.env.users,
	icon: 'ti ti-users',
}] : []), {
	key: 'raw',
	title: 'Raw',
	icon: 'ti ti-code',
}]);

definePage(() => ({
	title: props.host,
	icon: 'ti ti-server',
}));
</script>

<style lang="scss" module>
.faviconAndName {
	display: flex;
	align-items: center;
}
.icon {
	display: block;
	margin: 0 16px 0 0;
	height: 64px;
	border-radius: 8px;
}
.name {
	word-break: break-all;
}
.selects {
	display: flex;
	margin: 0 0 16px 0;
}
.label {
	margin-bottom: 12px;
	font-weight: bold;
}
.users {
	display: grid;
	grid-template-columns: repeat(auto-fill,minmax(270px,1fr));
	grid-gap: 12px;
}
</style>
