<template>
<div>
	<portal to="icon"><fa :icon="faHashtag"/></portal>
	<portal to="title">{{ $t('explore') }}</portal>

	<div class="localfedi7 _panel" v-if="meta && stats && tag == null" :style="{ backgroundImage: meta.bannerUrl ? `url(${meta.bannerUrl})` : null }">
		<header>{{ $t('explore', { host: meta.name || 'Misskey' }) }}</header>
		<div>{{ $t('users-info', { users: num(stats.originalUsersCount) }) }}</div>
	</div>

	<template v-if="tag == null">
		<x-user-list :pagination="pinnedUsers" :expanded="false">
			<fa :icon="faBookmark" fixed-width/>{{ $t('pinned-users') }}
		</x-user-list>
		<x-user-list :pagination="popularUsers" :expanded="false">
			<fa :icon="faChartLine" fixed-width/>{{ $t('popular-users') }}
		</x-user-list>
		<x-user-list :pagination="recentlyUpdatedUsers" :expanded="false">
			<fa :icon="faCommentAlt" fixed-width/>{{ $t('recently-updated-users') }}
		</x-user-list>
		<x-user-list :pagination="recentlyRegisteredUsers" :expanded="false">
			<fa :icon="faPlus" fixed-width/>{{ $t('recently-registered-users') }}
		</x-user-list>
	</template>

	<div class="localfedi7 _panel" v-if="tag == null" :style="{ backgroundImage: `url(/assets/fedi.jpg)` }">
		<header>{{ $t('explore-fediverse') }}</header>
	</div>

	<x-container :body-togglable="true" :expanded="false" ref="tags">
		<template #header><fa :icon="faHashtag" fixed-width/>{{ $t('popular-tags') }}</template>

		<div class="vxjfqztj">
			<router-link v-for="tag in tagsLocal" :to="`/explore/tags/${tag.tag}`" :key="'local:' + tag.tag" class="local">{{ tag.tag }}</router-link>
			<router-link v-for="tag in tagsRemote" :to="`/explore/tags/${tag.tag}`" :key="'remote:' + tag.tag">{{ tag.tag }}</router-link>
		</div>
	</x-container>

	<x-user-list v-if="tag != null" :pagination="tagUsers" :key="`${tag}`">
		<fa :icon="faHashtag" fixed-width/>{{ tag }}
	</x-user-list>
	<template v-if="tag == null">
		<x-user-list :pagination="popularUsersF" :expanded="false">
			<fa :icon="faChartLine" fixed-width/>{{ $t('popular-users') }}
		</x-user-list>
		<x-user-list :pagination="recentlyUpdatedUsersF" :expanded="false">
			<fa :icon="faCommentAlt" fixed-width/>{{ $t('recently-updated-users') }}
		</x-user-list>
		<x-user-list :pagination="recentlyRegisteredUsersF" :expanded="false">
			<fa :icon="faRocket" fixed-width/>{{ $t('recently-discovered-users') }}
		</x-user-list>
	</template>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faChartLine, faPlus, faHashtag, faRocket } from '@fortawesome/free-solid-svg-icons';
import { faBookmark, faCommentAlt } from '@fortawesome/free-regular-svg-icons';
import i18n from '../i18n';
import XUserList from '../components/user-list.vue';

export default Vue.extend({
	i18n,

	metaInfo() {
		return {
			title: this.$t('explore') as string
		};
	},

	components: {
		XUserList
	},

	props: {
		tag: {
			type: String,
			required: false
		}
	},

	data() {
		return {
			pinnedUsers: { endpoint: 'pinned-users' },
			popularUsers: { endpoint: 'users', limit: 10, params: {
				state: 'alive',
				origin: 'local',
				sort: '+follower',
			} },
			recentlyUpdatedUsers: { endpoint: 'users', limit: 10, params: {
				origin: 'local',
				sort: '+updatedAt',
			} },
			recentlyRegisteredUsers: { endpoint: 'users', limit: 10, params: {
				origin: 'local',
				state: 'alive',
				sort: '+createdAt',
			} },
			popularUsersF: { endpoint: 'users', limit: 10, params: {
				state: 'alive',
				origin: 'remote',
				sort: '+follower',
			} },
			recentlyUpdatedUsersF: { endpoint: 'users', limit: 10, params: {
				origin: 'combined',
				sort: '+updatedAt',
			} },
			recentlyRegisteredUsersF: { endpoint: 'users', limit: 10, params: {
				origin: 'combined',
				sort: '+createdAt',
			} },
			tagsLocal: [],
			tagsRemote: [],
			stats: null,
			meta: null,
			num: Vue.filter('number'),
			faBookmark, faChartLine, faCommentAlt, faPlus, faHashtag, faRocket
		};
	},

	computed: {
		tagUsers(): any {
			return {
				endpoint: 'hashtags/users',
				limit: 30,
				params: {
					tag: this.tag,
					origin: 'combined',
					sort: '+follower',
				}
			};
		},
	},

	watch: {
		tag() {
			if (this.$refs.tags) this.$refs.tags.toggleContent(this.tag == null);
		}
	},

	created() {
		this.$emit('init', {
			title: this.$t('@.explore'),
			icon: faHashtag
		});
		this.$root.api('hashtags/list', {
			sort: '+attachedLocalUsers',
			attachedToLocalUserOnly: true,
			limit: 30
		}).then(tags => {
			this.tagsLocal = tags;
		});
		this.$root.api('hashtags/list', {
			sort: '+attachedRemoteUsers',
			attachedToRemoteUserOnly: true,
			limit: 30
		}).then(tags => {
			this.tagsRemote = tags;
		});
		this.$root.api('stats').then(stats => {
			this.stats = stats;
		});
		this.$root.getMeta().then(meta => {
			this.meta = meta;
		});
	},
});
</script>

<style lang="scss" scoped>
.localfedi7 {
	color: #fff;
	text-shadow: 0 0 8px #000;
	padding: 16px;
	height: 80px;
	background-position: 50%;
	background-size: cover;
	margin-bottom: 16px;

	@media (max-width: 500px) {
		margin-bottom: 8px;
	}

	> header {
		font-size: 20px;
		font-weight: bold;
	}

	> div {
		font-size: 14px;
		opacity: 0.8;
	}
}

.vxjfqztj {
	padding: 16px;

	> * {
		margin-right: 16px;

		&.local {
			font-weight: bold;
		}
	}
}
</style>