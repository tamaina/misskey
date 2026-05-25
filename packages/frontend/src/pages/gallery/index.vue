<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs" :swipable="true">
	<div class="_spacer" style="--MI_SPACER-w: 1400px;">
		<div v-if="tab === 'explore'">
			<MkFoldableSection class="_margin">
				<template #header><i class="ti ti-clock"></i>{{ $locale.env.recentPosts }}</template>
				<MkPagination v-slot="{items}" :paginator="recentPostsPaginator">
					<div :class="$style.items">
						<MkGalleryPostPreview v-for="post in items" :key="post.id" :post="post" class="post"/>
					</div>
				</MkPagination>
			</MkFoldableSection>
			<MkFoldableSection class="_margin">
				<template #header><i class="ti ti-comet"></i>{{ $locale.env.popularPosts }}</template>
				<MkPagination v-slot="{items}" :paginator="popularPostsPaginator">
					<div :class="$style.items">
						<MkGalleryPostPreview v-for="post in items" :key="post.id" :post="post" class="post"/>
					</div>
				</MkPagination>
			</MkFoldableSection>
		</div>
		<div v-else-if="tab === 'liked'">
			<MkPagination v-slot="{items}" :paginator="likedPostsPaginator">
				<div :class="$style.items">
					<MkGalleryPostPreview v-for="like in items" :key="like.id" :post="like.post" class="post"/>
				</div>
			</MkPagination>
		</div>
		<div v-else-if="tab === 'my'">
			<MkA to="/gallery/new" class="_link" style="margin: 16px;"><i class="ti ti-plus"></i> {{ $locale.env.postToGallery }}</MkA>
			<MkPagination v-slot="{items}" :paginator="myPostsPaginator">
				<div :class="$style.items">
					<MkGalleryPostPreview v-for="post in items" :key="post.id" :post="post" class="post"/>
				</div>
			</MkPagination>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { $locale as localeRef } from '@/i18n.js';

import { watch, ref, computed, markRaw } from 'vue';
import MkFoldableSection from '@/components/MkFoldableSection.vue';
import MkPagination from '@/components/MkPagination.vue';
import MkGalleryPostPreview from '@/components/MkGalleryPostPreview.vue';
import { definePage } from '@/page.js';
import { useRouter } from '@/router.js';
import { Paginator } from '@/utility/paginator.js';

const router = useRouter();

const props = defineProps<{
	tag?: string;
}>();

const tab = ref('explore');
const tagsRef = ref();

const recentPostsPaginator = markRaw(new Paginator('gallery/posts', {
	limit: 6,
}));
const popularPostsPaginator = markRaw(new Paginator('gallery/featured', {
	noPaging: true,
}));
const myPostsPaginator = markRaw(new Paginator('i/gallery/posts', {
	limit: 5,
}));
const likedPostsPaginator = markRaw(new Paginator('i/gallery/likes', {
	limit: 5,
}));

watch(() => props.tag, () => {
	if (tagsRef.value) tagsRef.value.tags.toggleContent(props.tag == null);
});

const headerActions = computed(() => [{
	icon: 'ti ti-plus',
	text: localeRef.value.env.create,
	handler: () => {
		router.push('/gallery/new');
	},
}]);

const headerTabs = computed(() => [{
	key: 'explore',
	title: localeRef.value.env.gallery,
	icon: 'ti ti-icons',
}, {
	key: 'liked',
	title: localeRef.value.env._gallery.liked,
	icon: 'ti ti-heart',
}, {
	key: 'my',
	title: localeRef.value.env._gallery.my,
	icon: 'ti ti-edit',
}]);

definePage(() => ({
	title: localeRef.value.env.gallery,
	icon: 'ti ti-icons',
}));
</script>

<style lang="scss" module>
.items {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	grid-gap: 12px;
	margin: 0 var(--MI-margin);
}
</style>
