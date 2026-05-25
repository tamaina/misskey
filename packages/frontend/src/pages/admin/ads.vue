<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="headerActions" :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 900px;">
		<MkSelect v-model="filterType" :items="filterTypeDef" :class="$style.input" @update:modelValue="filterItems">
			<template #label>{{ $locale.env.state }}</template>
		</MkSelect>

		<div>
			<div v-for="ad in ads" class="_panel _gaps_m" :class="$style.ad">
				<MkAd v-if="ad.url" :key="ad.id" :specify="ad"/>

				<MkInput v-model="ad.url" type="url">
					<template #label>URL</template>
				</MkInput>

				<MkInput v-model="ad.imageUrl" type="url">
					<template #label>{{ $locale.env.imageUrl }}</template>
				</MkInput>

				<MkRadios
					v-model="ad.place"
					:options="[
						{ value: 'square' },
						{ value: 'horizontal' },
						{ value: 'horizontal-big' },
					]"
				>
					<template #label>Form</template>
				</MkRadios>

				<FormSplit>
					<MkInput v-model="ad.ratio" type="number">
						<template #label>{{ $locale.env.ratio }}</template>
					</MkInput>
					<MkInput v-model="ad.startsAt" type="datetime-local">
						<template #label>{{ $locale.env.startingperiod }}</template>
					</MkInput>
					<MkInput v-model="ad.expiresAt" type="datetime-local">
						<template #label>{{ $locale.env.expiration }}</template>
					</MkInput>
				</FormSplit>

				<MkSwitch v-model="ad.isSensitive">
					<template #label>{{ $locale.env.sensitive }}</template>
				</MkSwitch>

				<MkFolder>
					<template #label>{{ $locale.env.advancedSettings }}</template>
					<span>
						{{ $locale.env._ad.timezoneinfo }}
						<div v-for="(day, index) in daysOfWeek" :key="index">
							<input
								:id="`ad${ad.id}-${index}`" type="checkbox" :checked="(ad.dayOfWeek & (1 << index)) !== 0"
								@change="toggleDayOfWeek(ad, index)"
							>
							<label :for="`ad${ad.id}-${index}`">{{ day }}</label>
						</div>
					</span>
				</MkFolder>

				<MkTextarea v-model="ad.memo">
					<template #label>{{ $locale.env.memo }}</template>
				</MkTextarea>

				<div class="_buttons">
					<MkButton inline primary style="margin-right: 12px;" @click="save(ad)">
						<i
							class="ti ti-device-floppy"
						></i> {{ $locale.env.save }}
					</MkButton>
					<MkButton inline danger @click="remove(ad)">
						<i class="ti ti-trash"></i> {{ $locale.env.remove }}
					</MkButton>
				</div>
			</div>

			<MkButton @click="more()">
				<i class="ti ti-reload"></i>{{ $locale.env.more }}
			</MkButton>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { $locale as localeRef, $l as localizerRef } from '@/i18n.js';

import { ref, computed } from 'vue';
import * as Misskey from 'misskey-js';
import MkButton from '@/components/MkButton.vue';
import MkInput from '@/components/MkInput.vue';
import MkTextarea from '@/components/MkTextarea.vue';
import MkRadios from '@/components/MkRadios.vue';
import MkFolder from '@/components/MkFolder.vue';
import MkSelect from '@/components/MkSelect.vue';
import FormSplit from '@/components/form/split.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { definePage } from '@/page.js';
import { useMkSelect } from '@/composables/use-mkselect.js';

type Ad = Misskey.entities.Ad & {
	place: 'square' | 'horizontal' | 'horizontal-big';
};

const ads = ref<Ad[]>([]);

// ISO形式はTZがUTCになってしまうので、TZ分ずらして時間を初期化
const localTime = new Date();
const localTimeDiff = localTime.getTimezoneOffset() * 60 * 1000;
const daysOfWeek: string[] = [localeRef.value.env._weekday.sunday, localeRef.value.env._weekday.monday, localeRef.value.env._weekday.tuesday, localeRef.value.env._weekday.wednesday, localeRef.value.env._weekday.thursday, localeRef.value.env._weekday.friday, localeRef.value.env._weekday.saturday];
const {
	model: filterType,
	def: filterTypeDef,
} = useMkSelect({
	items: [
		{ label: localeRef.value.env.all, value: 'all' },
		{ label: localeRef.value.env.publishing, value: 'publishing' },
		{ label: localeRef.value.env.expired, value: 'expired' },
	],
	initialValue: 'all',
});
let publishing: boolean | null = null;

misskeyApi('admin/ad/list', { publishing: publishing }).then(adsResponse => {
	if (adsResponse != null) {
		ads.value = adsResponse.map(r => {
			const exdate = new Date(r.expiresAt);
			const stdate = new Date(r.startsAt);
			exdate.setMilliseconds(exdate.getMilliseconds() - localTimeDiff);
			stdate.setMilliseconds(stdate.getMilliseconds() - localTimeDiff);
			return {
				...(r as Ad),
				expiresAt: exdate.toISOString().slice(0, 16),
				startsAt: stdate.toISOString().slice(0, 16),
			};
		});
	}
});

const filterItems = (v: typeof filterType.value) => {
	if (v === 'publishing') {
		publishing = true;
	} else if (v === 'expired') {
		publishing = false;
	} else {
		publishing = null;
	}

	refresh();
};

// 選択された曜日(index)のビットフラグを操作する
function toggleDayOfWeek(ad: Misskey.entities.Ad, index: number) {
	ad.dayOfWeek ^= 1 << index;
}

function add() {
	ads.value.unshift({
		id: '',
		memo: '',
		place: 'square',
		priority: 'middle',
		ratio: 1,
		url: '',
		imageUrl: '',
		expiresAt: new Date().toISOString(),
		startsAt: new Date().toISOString(),
		dayOfWeek: 0,
		isSensitive: false,
	});
}

function remove(ad: Misskey.entities.Ad) {
	os.confirm({
		type: 'warning',
		text: localizerRef.value.env.removeAreYouSure({ x: ad.url }),
	}).then(({ canceled }) => {
		if (canceled) return;
		ads.value = ads.value.filter(x => x !== ad);
		if (ad.id === '') return;
		os.apiWithDialog('admin/ad/delete', {
			id: ad.id,
		}).then(() => {
			refresh();
		});
	});
}

function save(ad: Misskey.entities.Ad) {
	if (ad.id === '') {
		misskeyApi('admin/ad/create', {
			...ad,
			expiresAt: new Date(ad.expiresAt).getTime(),
			startsAt: new Date(ad.startsAt).getTime(),
		}).then(() => {
			os.alert({
				type: 'success',
				text: localeRef.value.env.saved,
			});
			refresh();
		}).catch(err => {
			os.alert({
				type: 'error',
				text: err,
			});
		});
	} else {
		misskeyApi('admin/ad/update', {
			...ad,
			expiresAt: new Date(ad.expiresAt).getTime(),
			startsAt: new Date(ad.startsAt).getTime(),
		}).then(() => {
			os.alert({
				type: 'success',
				text: localeRef.value.env.saved,
			});
		}).catch(err => {
			os.alert({
				type: 'error',
				text: err,
			});
		});
	}
}

function more() {
	misskeyApi('admin/ad/list', { untilId: ads.value.reduce((acc, ad) => ad.id !== '' ? ad : acc).id, publishing: publishing }).then(adsResponse => {
		if (adsResponse == null) return;
		ads.value = ads.value.concat(adsResponse.map(r => {
			const exdate = new Date(r.expiresAt);
			const stdate = new Date(r.startsAt);
			exdate.setMilliseconds(exdate.getMilliseconds() - localTimeDiff);
			stdate.setMilliseconds(stdate.getMilliseconds() - localTimeDiff);
			return {
				...(r as Ad),
				expiresAt: exdate.toISOString().slice(0, 16),
				startsAt: stdate.toISOString().slice(0, 16),
			};
		}));
	});
}

function refresh() {
	misskeyApi('admin/ad/list', { publishing: publishing }).then(adsResponse => {
		if (adsResponse == null) return;
		ads.value = adsResponse.map(r => {
			const exdate = new Date(r.expiresAt);
			const stdate = new Date(r.startsAt);
			exdate.setMilliseconds(exdate.getMilliseconds() - localTimeDiff);
			stdate.setMilliseconds(stdate.getMilliseconds() - localTimeDiff);
			return {
				...(r as Ad),
				expiresAt: exdate.toISOString().slice(0, 16),
				startsAt: stdate.toISOString().slice(0, 16),
			};
		});
	});
}

refresh();

const headerActions = computed(() => [{
	asFullButton: true,
	icon: 'ti ti-plus',
	text: localeRef.value.env.add,
	handler: add,
}]);

const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env.ads,
	icon: 'ti ti-ad',
}));
</script>

<style lang="scss" module>
.ad {
	padding: 32px;

	&:not(:last-child) {
		margin-bottom: var(--MI-margin);
	}
}
.input {
	margin-bottom: 32px;
}
</style>
