<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<SearchMarker path="/settings/other" :label="$locale.env.other" :keywords="['other']" icon="ti ti-dots">
	<div class="_gaps_m">
		<!--
		<MkSwitch v-model="$i.injectFeaturedNote" @update:model-value="onChangeInjectFeaturedNote">
			<template #label>{{ $locale.env.showFeaturedNotesInTimeline }}</template>
		</MkSwitch>
		-->

		<!--
		<MkSwitch v-model="reportError">{{ $locale.env.sendErrorReports }}<template #caption>{{ $locale.env.sendErrorReportsDescription }}</template></MkSwitch>
		-->

		<div class="_gaps_s">
			<SearchMarker :keywords="['account', 'info']">
				<MkFolder>
					<template #icon><SearchIcon><i class="ti ti-info-circle"></i></SearchIcon></template>
					<template #label><SearchLabel>{{ $locale.env.accountInfo }}</SearchLabel></template>

					<div class="_gaps_m">
						<MkKeyValue>
							<template #key>ID</template>
							<template #value><span class="_monospace">{{ $i.id }}</span></template>
						</MkKeyValue>

						<MkKeyValue>
							<template #key>{{ $locale.env.registeredDate }}</template>
							<template #value><MkTime :time="$i.createdAt" mode="detail"/></template>
						</MkKeyValue>

						<SearchMarker :keywords="['role', 'policy']">
							<MkFolder>
								<template #icon><i class="ti ti-badges"></i></template>
								<template #label><SearchLabel>{{ $locale.env._role.policies }}</SearchLabel></template>

								<div class="_gaps_s">
									<div v-for="policy in Object.keys($i.policies)" :key="policy">
										{{ policy }} ... {{ $i.policies[policy as keyof typeof $i.policies] }}
									</div>
								</div>
							</MkFolder>
						</SearchMarker>
					</div>
				</MkFolder>
			</SearchMarker>

			<SearchMarker :keywords="['roles']">
				<MkFolder>
					<template #icon><SearchIcon><i class="ti ti-badges"></i></SearchIcon></template>
					<template #label><SearchLabel>{{ $locale.env.rolesAssignedToMe }}</SearchLabel></template>

					<div class="_gaps_s">
						<MkRolePreview v-for="role in $i.roles" :key="role.id" :role="role" :forModeration="false"/>
					</div>
				</MkFolder>
			</SearchMarker>

			<SearchMarker :keywords="['account', 'move', 'migration']">
				<MkFolder>
					<template #icon><SearchIcon><i class="ti ti-plane"></i></SearchIcon></template>
					<template #label><SearchLabel>{{ $locale.env.accountMigration }}</SearchLabel></template>

					<XMigration/>
				</MkFolder>
			</SearchMarker>

			<SearchMarker :keywords="['account', 'close', 'delete']">
				<MkFolder>
					<template #icon><SearchIcon><i class="ti ti-alert-triangle"></i></SearchIcon></template>
					<template #label><SearchLabel>{{ $locale.env.closeAccount }}</SearchLabel></template>

					<div class="_gaps_m">
						<FormInfo warn>{{ $locale.env._accountDelete.mayTakeTime }}</FormInfo>
						<FormInfo>{{ $locale.env._accountDelete.sendEmail }}</FormInfo>
						<MkButton v-if="!$i.isDeleted" danger @click="deleteAccount"><SearchText>{{ $locale.env._accountDelete.requestAccountDelete }}</SearchText></MkButton>
						<MkButton v-else disabled>{{ $locale.env._accountDelete.inProgress }}</MkButton>
					</div>
				</MkFolder>
			</SearchMarker>

			<SearchMarker :keywords="['experimental', 'feature', 'flags']">
				<MkFolder>
					<template #icon><SearchIcon><i class="ti ti-flask"></i></SearchIcon></template>
					<template #label><SearchLabel>{{ $locale.env.experimentalFeatures }}</SearchLabel></template>

					<div class="_gaps_m">
						<MkSwitch v-model="enableCondensedLine">
							<template #label>Enable condensed line</template>
						</MkSwitch>
						<MkSwitch v-model="skipNoteRender">
							<template #label>Enable note render skipping</template>
						</MkSwitch>
						<MkSwitch v-model="stackingRouterView">
							<template #label>Enable stacking router view</template>
						</MkSwitch>
						<MkSwitch v-model="enableFolderPageView">
							<template #label>Enable folder page view</template>
						</MkSwitch>
						<MkSwitch v-model="enableHapticFeedback">
							<template #label>Enable haptic feedback</template>
						</MkSwitch>
						<MkSwitch v-model="enableWebTranslatorApi">
							<template #label>Enable in-browser translator API</template>
						</MkSwitch>
					</div>
				</MkFolder>
			</SearchMarker>

			<SearchMarker :keywords="['developer', 'mode', 'debug']">
				<MkFolder>
					<template #icon><SearchIcon><i class="ti ti-code"></i></SearchIcon></template>
					<template #label><SearchLabel>{{ $locale.env.developer }}</SearchLabel></template>

					<div class="_gaps_m">
						<MkSwitch v-model="devMode">
							<template #label>{{ $locale.env.devMode }}</template>
						</MkSwitch>
					</div>
				</MkFolder>
			</SearchMarker>
		</div>

		<hr>

		<FormLink to="/registry"><template #icon><i class="ti ti-adjustments"></i></template>{{ $locale.env.registry }}</FormLink>

		<hr>

		<MkButton @click="resetAllTips"><i class="ti ti-bulb"></i> {{ $locale.env.redisplayAllTips }}</MkButton>
		<MkButton @click="hideAllTips"><i class="ti ti-bulb-off"></i> {{ $locale.env.hideAllTips }}</MkButton>

		<hr>

		<template v-if="$i.policies.chatAvailability !== 'unavailable'">
			<MkButton @click="readAllChatMessages">{{ $locale.env.readAllChatMessages }}</MkButton>

			<hr>
		</template>

		<MkButton v-if="storagePersistenceSupported && !storagePersisted" @click="enableStoragePersistence">{{ $locale.env._settings.settingsPersistence_title }}</MkButton>

		<MkButton @click="forceCloudBackup">{{ $locale.env._preferencesBackup.forceBackup }}</MkButton>

		<FormSlot>
			<MkButton danger @click="migrate"><i class="ti ti-refresh"></i> {{ $locale.env.migrateOldSettings }}</MkButton>
			<template #caption>{{ $locale.env.migrateOldSettings_description }}</template>
		</FormSlot>
	</div>
</SearchMarker>
</template>

<script lang="ts" setup>
import { $locale as localeRef } from '@/i18n.js';

import { computed, watch } from 'vue';
import XMigration from './migration.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import FormLink from '@/components/form/link.vue';
import MkFolder from '@/components/MkFolder.vue';
import FormInfo from '@/components/MkInfo.vue';
import MkKeyValue from '@/components/MkKeyValue.vue';
import MkButton from '@/components/MkButton.vue';
import FormSlot from '@/components/form/slot.vue';
import * as os from '@/os.js';
import { enableStoragePersistence, getStoragePersistenceStatusRef, storagePersistenceSupported } from '@/utility/storage.js';
import { ensureSignin } from '@/i.js';
import { definePage } from '@/page.js';
import FormSection from '@/components/form/section.vue';
import { prefer } from '@/preferences.js';
import MkRolePreview from '@/components/MkRolePreview.vue';
import { signout } from '@/signout.js';
import { migrateOldSettings } from '@/pref-migrate.js';
import { hideAllTips as _hideAllTips, resetAllTips as _resetAllTips } from '@/tips.js';
import { suggestReload } from '@/utility/reload-suggest.js';
import { cloudBackup } from '@/preferences/utility.js';

const $i = ensureSignin();

const storagePersisted = await getStoragePersistenceStatusRef();

const reportError = prefer.model('reportError');
const enableCondensedLine = prefer.model('enableCondensedLine');
const skipNoteRender = prefer.model('skipNoteRender');
const devMode = prefer.model('devMode');
const stackingRouterView = prefer.model('experimental.stackingRouterView');
const enableFolderPageView = prefer.model('experimental.enableFolderPageView');
const enableHapticFeedback = prefer.model('experimental.enableHapticFeedback');
const enableWebTranslatorApi = prefer.model('experimental.enableWebTranslatorApi');

watch(skipNoteRender, () => {
	suggestReload();
});

async function deleteAccount() {
	{
		const { canceled } = await os.confirm({
			type: 'warning',
			text: localeRef.value.env.deleteAccountConfirm,
		});
		if (canceled) return;
	}

	const auth = await os.authenticateDialog();
	if (auth.canceled) return;

	await os.apiWithDialog('i/delete-account', {
		password: auth.result.password,
		token: auth.result.token,
	});

	await os.alert({
		title: localeRef.value.env._accountDelete.started,
	});

	await signout();
}

function migrate() {
	migrateOldSettings();
}

function resetAllTips() {
	_resetAllTips();
	os.success();
}

function hideAllTips() {
	_hideAllTips();
	os.success();
}

function readAllChatMessages() {
	os.apiWithDialog('chat/read-all', {});
}

async function forceCloudBackup() {
	await cloudBackup();
	os.success();
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env.other,
	icon: 'ti ti-dots',
}));
</script>
