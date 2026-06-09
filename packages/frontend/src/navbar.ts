/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { computed, reactive } from 'vue';
import { ui } from '@@/js/config.js';
import { clearCache } from './utility/clear-cache.js';
import type { ComputedRef } from 'vue';
import { $i } from '@/i.js';
import { miLocalStorage } from '@/local-storage.js';
import { openInstanceMenu, openToolsMenu } from '@/ui/_common_/common.js';
import { lookup } from '@/utility/lookup.js';
import * as os from '@/os.js';
import { unisonReload } from '@/utility/unison-reload.js';
import { useLocale } from 'virtual:vite-vue-internationalization';

const localeRef = useLocale(import.meta.url);

export const navbarItemDef = reactive<{
	[key: string]: {
		title: string;
		icon: string;
		show?: ComputedRef<boolean>;
		indicated?: ComputedRef<boolean>;
		indicateValue?: ComputedRef<string>;
		to?: string;
		action?: (ev: PointerEvent) => void;
	};
}>({
	notifications: {
		get title() { return localeRef.value.env.notifications; },
		icon: 'ti ti-bell',
		show: computed(() => $i != null),
		indicated: computed(() => $i != null && $i.hasUnreadNotification),
		indicateValue: computed(() => {
			if (!$i || $i.unreadNotificationsCount === 0) return '';

			if ($i.unreadNotificationsCount > 99) {
				return '99+';
			} else {
				return $i.unreadNotificationsCount.toString();
			}
		}),
		to: '/my/notifications',
	},
	drive: {
		get title() { return localeRef.value.env.drive; },
		icon: 'ti ti-cloud',
		show: computed(() => $i != null),
		to: '/my/drive',
	},
	followRequests: {
		get title() { return localeRef.value.env.followRequests; },
		icon: 'ti ti-user-plus',
		indicated: computed(() => $i != null && $i.hasPendingReceivedFollowRequest),
		to: '/my/follow-requests',
	},
	explore: {
		get title() { return localeRef.value.env.explore; },
		icon: 'ti ti-hash',
		to: '/explore',
	},
	announcements: {
		get title() { return localeRef.value.env.announcements; },
		icon: 'ti ti-speakerphone',
		indicated: computed(() => $i != null && $i.hasUnreadAnnouncement),
		to: '/announcements',
	},
	search: {
		get title() { return localeRef.value.env.search; },
		icon: 'ti ti-search',
		to: '/search',
	},
	lookup: {
		get title() { return localeRef.value.env.lookup; },
		icon: 'ti ti-world-search',
		action: (ev) => {
			lookup();
		},
	},
	qr: {
		get title() { return localeRef.value.env.qr; },
		icon: 'ti ti-qrcode',
		show: computed(() => $i != null),
		to: '/qr',
	},
	lists: {
		get title() { return localeRef.value.env.lists; },
		icon: 'ti ti-list',
		show: computed(() => $i != null),
		to: '/my/lists',
	},
	antennas: {
		get title() { return localeRef.value.env.antennas; },
		icon: 'ti ti-antenna',
		show: computed(() => $i != null),
		to: '/my/antennas',
	},
	favorites: {
		get title() { return localeRef.value.env.favorites; },
		icon: 'ti ti-star',
		show: computed(() => $i != null),
		to: '/my/favorites',
	},
	pages: {
		get title() { return localeRef.value.env.pages; },
		icon: 'ti ti-news',
		to: '/pages',
	},
	play: {
		title: 'Play',
		icon: 'ti ti-player-play',
		to: '/play',
	},
	gallery: {
		get title() { return localeRef.value.env.gallery; },
		icon: 'ti ti-icons',
		to: '/gallery',
	},
	clips: {
		get title() { return localeRef.value.env.clip; },
		icon: 'ti ti-paperclip',
		show: computed(() => $i != null),
		to: '/my/clips',
	},
	channels: {
		get title() { return localeRef.value.env.channel; },
		icon: 'ti ti-device-tv',
		to: '/channels',
	},
	chat: {
		get title() { return localeRef.value.env.directMessage_short; },
		icon: 'ti ti-messages',
		to: '/chat',
		show: computed(() => $i != null && $i.policies.chatAvailability !== 'unavailable'),
		indicated: computed(() => $i != null && $i.hasUnreadChatMessages),
	},
	achievements: {
		get title() { return localeRef.value.env.achievements; },
		icon: 'ti ti-medal',
		show: computed(() => $i != null),
		to: '/my/achievements',
	},
	games: {
		title: 'Misskey Games',
		icon: 'ti ti-device-gamepad',
		to: '/games',
	},
	ui: {
		get title() { return localeRef.value.env.switchUi; },
		icon: 'ti ti-devices',
		action: (ev) => {
			os.popupMenu([{
				text: localeRef.value.env.default,
				active: ui === 'default' || ui === null,
				action: () => {
					miLocalStorage.setItem('ui', 'default');
					unisonReload();
				},
			}, {
				text: localeRef.value.env.deck,
				active: ui === 'deck',
				action: () => {
					miLocalStorage.setItem('ui', 'deck');
					unisonReload();
				},
			}], ev.currentTarget ?? ev.target);
		},
	},
	about: {
		get title() { return localeRef.value.env.about; },
		icon: 'ti ti-info-circle',
		action: (ev) => {
			openInstanceMenu(ev);
		},
	},
	tools: {
		get title() { return localeRef.value.env.tools; },
		icon: 'ti ti-tool',
		action: (ev) => {
			openToolsMenu(ev);
		},
	},
	reload: {
		get title() { return localeRef.value.env.reload; },
		icon: 'ti ti-refresh',
		action: (ev) => {
			window.location.reload();
		},
	},
	profile: {
		get title() { return localeRef.value.env.profile; },
		icon: 'ti ti-user',
		show: computed(() => $i != null),
		to: `/@${$i?.username}`,
	},
	cacheClear: {
		get title() { return localeRef.value.env.clearCache; },
		icon: 'ti ti-trash',
		action: (ev) => {
			clearCache();
		},
	},
});
