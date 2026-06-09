<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader v-model:tab="tab" :tabs="headerTabs">
	<div v-if="error != null" class="_spacer" style="--MI_SPACER-w: 1200px;">
		<MkResult type="error" :text="error"/>
	</div>
	<div v-else-if="tab === 'users'" class="_spacer" style="--MI_SPACER-w: 1200px;">
		<div class="_gaps_s">
			<div v-if="role">{{ role.description }}</div>
			<MkUserList v-if="visible" :paginator="usersPaginator" :extractor="(item) => item.user"/>
			<MkResult v-else-if="!visible" type="empty" :text="$locale.env.nothing"/>
		</div>
	</div>
	<div v-else-if="tab === 'timeline'" class="_spacer" style="--MI_SPACER-w: 700px;">
		<MkStreamingNotesTimeline v-if="visible" ref="timeline" src="role" :role="props.roleId"/>
		<MkResult v-else-if="!visible" type="empty" :text="$locale.env.nothing"/>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { computed, watch, ref, markRaw } from 'vue';
import * as Misskey from 'misskey-js';
import { misskeyApi } from '@/utility/misskey-api.js';
import MkUserList from '@/components/MkUserList.vue';
import { definePage } from '@/page.js';
import MkStreamingNotesTimeline from '@/components/MkStreamingNotesTimeline.vue';
import { Paginator } from '@/utility/paginator.js';
const localeRef = useLocale(import.meta.url);

const props = withDefaults(defineProps<{
	roleId: string;
	initialTab?: string;
}>(), {
	initialTab: 'users',
});

// eslint-disable-next-line vue/no-setup-props-reactivity-loss
const tab = ref(props.initialTab);
const role = ref<Misskey.entities.Role | null>(null);
const error = ref<string | null>(null);
const visible = ref(false);

watch(() => props.roleId, () => {
	misskeyApi('roles/show', {
		roleId: props.roleId,
	}).then(res => {
		role.value = res;
		error.value = null;
		visible.value = res.isExplorable && res.isPublic;
	}).catch((err) => {
		if (err.code === 'NO_SUCH_ROLE') {
			error.value = localeRef.value.env.noRole;
		} else {
			error.value = localeRef.value.env.somethingHappened;
		}
	});
}, { immediate: true });

const usersPaginator = markRaw(new Paginator('roles/users', {
	limit: 30,
	computedParams: computed(() => ({
		roleId: props.roleId,
	})),
}));

const headerTabs = computed(() => [{
	key: 'users',
	icon: 'ti ti-users',
	title: localeRef.value.env.users,
}, {
	key: 'timeline',
	icon: 'ti ti-pencil',
	title: localeRef.value.env.timeline,
}]);

definePage(() => ({
	title: role.value ? role.value.name : (error.value ?? localeRef.value.env.role),
	icon: 'ti ti-badge',
}));
</script>
