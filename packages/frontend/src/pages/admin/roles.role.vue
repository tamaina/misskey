<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="headerActions" :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 700px;">
		<div class="_gaps">
			<div class="_buttons">
				<MkButton primary rounded @click="edit"><i class="ti ti-pencil"></i> {{ $locale.env.edit }}</MkButton>
				<MkButton danger rounded @click="del"><i class="ti ti-trash"></i> {{ $locale.env.delete }}</MkButton>
			</div>
			<MkFolder>
				<template #icon><i class="ti ti-info-circle"></i></template>
				<template #label>{{ $locale.env.info }}</template>
				<XEditor :modelValue="role" readonly/>
			</MkFolder>
			<MkFolder v-if="role.target === 'manual'" defaultOpen>
				<template #icon><i class="ti ti-users"></i></template>
				<template #label>{{ $locale.env.users }}</template>
				<template #suffix>{{ role.usersCount }}</template>
				<div class="_gaps">
					<MkButton primary rounded @click="assign"><i class="ti ti-plus"></i> {{ $locale.env.assign }}</MkButton>

					<MkPagination :paginator="usersPaginator">
						<template #empty><MkResult type="empty" :text="$locale.env.noUsers"/></template>

						<template #default="{ items }">
							<div class="_gaps_s">
								<div v-for="item in items" :key="item.user.id" :class="[$style.userItem, { [$style.userItemOpened]: expandedItemIds.includes(item.id) }]">
									<div :class="$style.userItemMain">
										<MkA :class="$style.userItemMainBody" :to="`/admin/user/${item.user.id}`">
											<MkUserCardMini :user="item.user"/>
										</MkA>
										<button class="_button" :class="$style.userToggle" @click="toggleItem(item.id)"><i :class="$style.chevron" class="ti ti-chevron-down"></i></button>
										<button class="_button" :class="$style.unassign" @click="unassign(item.user.id, $event)"><i class="ti ti-x"></i></button>
									</div>
									<div v-if="expandedItemIds.includes(item.id)" :class="$style.userItemSub">
										<div>Assigned: <MkTime :time="item.createdAt" mode="detail"/></div>
										<div v-if="item.expiresAt">Period: {{ new Date(item.expiresAt).toLocaleString() }}</div>
										<div v-else>Period: {{ $locale.env.indefinitely }}</div>
									</div>
								</div>
							</div>
						</template>
					</MkPagination>
				</div>
			</MkFolder>
			<MkInfo v-else>{{ $locale.env._role.isConditionalRole }}</MkInfo>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { useLocale, useLocalizer } from 'virtual:vite-vue-internationalization';

import { computed, markRaw, reactive, ref } from 'vue';
import * as Misskey from 'misskey-js';
import XEditor from './roles.editor.vue';
import MkFolder from '@/components/MkFolder.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { definePage } from '@/page.js';
import MkButton from '@/components/MkButton.vue';
import MkUserCardMini from '@/components/MkUserCardMini.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkPagination from '@/components/MkPagination.vue';
import { useRouter } from '@/router.js';
import { Paginator } from '@/utility/paginator.js';
const localeRef = useLocale(import.meta.url);
const localizerRef = useLocalizer(import.meta.url);

const router = useRouter();

const props = defineProps<{
	id: string;
}>();

const usersPaginator = markRaw(new Paginator('admin/roles/users', {
	limit: 20,
	computedParams: computed(() => props.id ? ({
		roleId: props.id,
	}) : undefined),
}));

const expandedItemIds = ref<Misskey.entities.AdminRolesUsersResponse[number]['id'][]>([]);

const role = reactive(await misskeyApi('admin/roles/show', {
	roleId: props.id,
}));

function edit() {
	router.push('/admin/roles/:id/edit', {
		params: {
			id: role.id,
		},
	});
}

async function del() {
	const { canceled } = await os.confirm({
		type: 'warning',
		text: localizerRef.value.env.deleteAreYouSure({ x: role.name }),
	});
	if (canceled) return;

	await os.apiWithDialog('admin/roles/delete', {
		roleId: role.id,
	});

	router.push('/admin/roles');
}

async function assign() {
	const user = await os.selectUser({ includeSelf: true });

	const { canceled: canceled2, result: period } = await os.select({
		title: localeRef.value.env.period + ': ' + role.name,
		items: [{
			value: 'indefinitely', label: localeRef.value.env.indefinitely,
		}, {
			value: 'oneHour', label: localeRef.value.env.oneHour,
		}, {
			value: 'oneDay', label: localeRef.value.env.oneDay,
		}, {
			value: 'oneWeek', label: localeRef.value.env.oneWeek,
		}, {
			value: 'oneMonth', label: localeRef.value.env.oneMonth,
		}],
		default: 'indefinitely',
	});
	if (canceled2) return;

	const expiresAt = period === 'indefinitely' ? null
		: period === 'oneHour' ? Date.now() + (1000 * 60 * 60)
		: period === 'oneDay' ? Date.now() + (1000 * 60 * 60 * 24)
		: period === 'oneWeek' ? Date.now() + (1000 * 60 * 60 * 24 * 7)
		: period === 'oneMonth' ? Date.now() + (1000 * 60 * 60 * 24 * 30)
		: null;

	await os.apiWithDialog('admin/roles/assign', { roleId: role.id, userId: user.id, expiresAt });
	//role.users.push(user);
	usersPaginator.reload();
}

async function unassign(userId: Misskey.entities.User['id'], ev: PointerEvent) {
	os.popupMenu([{
		text: localeRef.value.env.unassign,
		icon: 'ti ti-x',
		danger: true,
		action: async () => {
			await os.apiWithDialog('admin/roles/unassign', { roleId: role.id, userId: userId });
			//role.users = role.users.filter(u => u.id !== userId);
			usersPaginator.reload();
		},
	}], ev.currentTarget ?? ev.target);
}

async function toggleItem(itemId: string) {
	if (expandedItemIds.value.includes(itemId)) {
		expandedItemIds.value = expandedItemIds.value.filter(x => x !== itemId);
	} else {
		expandedItemIds.value.push(itemId);
	}
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: `${localeRef.value.env.role}: ${role.name}`,
	icon: 'ti ti-badge',
}));
</script>

<style lang="scss" module>
.userItemMain {
	display: flex;
}

.userItemSub {
	padding: 6px 12px;
	font-size: 85%;
	color: color(from var(--MI_THEME-fg) srgb r g b / 0.75);
}

.userItemMainBody {
	flex: 1;
	min-width: 0;
	margin-right: 8px;

	&:hover {
		text-decoration: none;
	}
}

.userToggle,
.unassign {
	width: 32px;
	height: 32px;
	align-self: center;
}

.chevron {
	display: block;
	transition: transform 0.1s ease-out;
}

.userItem.userItemOpened {
	.chevron {
		transform: rotateX(180deg);
	}
}
</style>
