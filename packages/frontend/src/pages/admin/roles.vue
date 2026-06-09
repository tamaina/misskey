<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="headerActions" :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 700px;">
		<div class="_gaps">
			<MkFolder>
				<template #label>{{ $locale.env._role.baseRole }}</template>
				<template #footer>
					<MkButton primary rounded @click="updateBaseRole">{{ $locale.env.save }}</MkButton>
				</template>
				<div class="_gaps_s">
					<MkInput v-model="baseRoleQ" type="search">
						<template #prefix><i class="ti ti-search"></i></template>
					</MkInput>

					<XPolicyEditor
						v-model:rolePolicies="policies"
						:isBaseRole="true"
						:roleQuery="baseRoleQ"
					/>
				</div>
			</MkFolder>
			<MkButton primary rounded @click="create"><i class="ti ti-plus"></i> {{ $locale.env._role.new }}</MkButton>
			<div class="_gaps_s">
				<MkFoldableSection>
					<template #header>{{ $locale.env._role.manualRoles }}</template>
					<div class="_gaps_s">
						<MkRolePreview v-for="role in roles.filter(x => x.target === 'manual')" :key="role.id" :role="role" :forModeration="true"/>
					</div>
				</MkFoldableSection>
				<MkFoldableSection>
					<template #header>{{ $locale.env._role.conditionalRoles }}</template>
					<div class="_gaps_s">
						<MkRolePreview v-for="role in roles.filter(x => x.target === 'conditional')" :key="role.id" :role="role" :forModeration="true"/>
					</div>
				</MkFoldableSection>
			</div>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { computed, reactive, ref } from 'vue';
import XPolicyEditor from './roles.policy-editor.vue';
import MkInput from '@/components/MkInput.vue';
import MkFolder from '@/components/MkFolder.vue';
import MkButton from '@/components/MkButton.vue';
import MkRolePreview from '@/components/MkRolePreview.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { definePage } from '@/page.js';
import { instance, fetchInstance } from '@/instance.js';
import MkFoldableSection from '@/components/MkFoldableSection.vue';
import { useRouter } from '@/router.js';
import { deepClone } from '@/utility/clone.js';
const localeRef = useLocale(import.meta.url);

const router = useRouter();
const baseRoleQ = ref('');

const roles = await misskeyApi('admin/roles/list');

const policies = reactive(deepClone(instance.policies));

async function updateBaseRole() {
	await os.apiWithDialog('admin/roles/update-default-policies', {
		//@ts-expect-error misskey-js側の型定義が不十分
		policies,
	});
	fetchInstance(true);
}

function create() {
	router.push('/admin/roles/new');
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env.roles,
	icon: 'ti ti-badges',
}));
</script>

<style lang="scss" module>

</style>
