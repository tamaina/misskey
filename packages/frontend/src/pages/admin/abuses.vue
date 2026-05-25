<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="headerActions" :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 900px;">
		<div :class="$style.root" class="_gaps">
			<div :class="$style.subMenus" class="_gaps">
				<MkButton type="routerLink" to="/admin/abuse-report-notification-recipient" primary>{{ $locale.env.notificationSetting }}</MkButton>
			</div>

			<MkTip k="abuses">
				{{ $locale.env._abuseUserReport.resolveTutorial }}
			</MkTip>

			<div :class="$style.inputs" class="_gaps">
				<MkSelect v-model="state" :items="stateDef" style="margin: 0; flex: 1;">
					<template #label>{{ $locale.env.state }}</template>
				</MkSelect>
				<MkSelect v-model="targetUserOrigin" :items="targetUserOriginDef" style="margin: 0; flex: 1;">
					<template #label>{{ $locale.env.reporteeOrigin }}</template>
				</MkSelect>
				<MkSelect v-model="reporterOrigin" :items="reporterOriginDef" style="margin: 0; flex: 1;">
					<template #label>{{ $locale.env.reporterOrigin }}</template>
				</MkSelect>
			</div>

			<!-- TODO
			<div class="inputs" style="display: flex; padding-top: 1.2em;">
				<MkInput v-model="searchUsername" style="margin: 0; flex: 1;" type="text" :spellcheck="false">
					<span>{{ $locale.env.username }}</span>
				</MkInput>
				<MkInput v-model="searchHost" style="margin: 0; flex: 1;" type="text" :spellcheck="false" :disabled="paginator.computedParams.value.origin === 'local'">
					<span>{{ $locale.env.host }}</span>
				</MkInput>
			</div>
			-->

			<MkPagination v-slot="{items}" :paginator="paginator">
				<div class="_gaps">
					<XAbuseReport v-for="report in items" :key="report.id" :report="report" @resolved="resolved"/>
				</div>
			</MkPagination>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { $locale as localeRef } from '@/i18n.js';

import { computed, ref, markRaw } from 'vue';
import MkSelect from '@/components/MkSelect.vue';
import MkPagination from '@/components/MkPagination.vue';
import XAbuseReport from '@/components/MkAbuseReport.vue';
import { definePage } from '@/page.js';
import { useMkSelect } from '@/composables/use-mkselect.js';
import MkButton from '@/components/MkButton.vue';
import { store } from '@/store.js';
import { Paginator } from '@/utility/paginator.js';

const {
	model: state,
	def: stateDef,
} = useMkSelect({
	items: [
		{ label: localeRef.value.env.all, value: 'all' },
		{ label: localeRef.value.env.unresolved, value: 'unresolved' },
		{ label: localeRef.value.env.resolved, value: 'resolved' },
	],
	initialValue: 'unresolved',
});
const {
	model: reporterOrigin,
	def: reporterOriginDef,
} = useMkSelect({
	items: [
		{ label: localeRef.value.env.all, value: 'combined' },
		{ label: localeRef.value.env.local, value: 'local' },
		{ label: localeRef.value.env.remote, value: 'remote' },
	],
	initialValue: 'combined',
});
const {
	model: targetUserOrigin,
	def: targetUserOriginDef,
} = useMkSelect({
	items: [
		{ label: localeRef.value.env.all, value: 'combined' },
		{ label: localeRef.value.env.local, value: 'local' },
		{ label: localeRef.value.env.remote, value: 'remote' },
	],
	initialValue: 'combined',
});
const searchUsername = ref('');
const searchHost = ref('');

const paginator = markRaw(new Paginator('admin/abuse-user-reports', {
	limit: 10,
	computedParams: computed(() => ({
		state: state.value,
		reporterOrigin: reporterOrigin.value,
		targetUserOrigin: targetUserOrigin.value,
	})),
}));

function resolved(reportId: string) {
	paginator.removeItem(reportId);
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env.abuseReports,
	icon: 'ti ti-exclamation-circle',
}));
</script>

<style module lang="scss">
.root {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: stretch;
}

.subMenus {
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	align-items: center;
}

.inputs {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
}
</style>
