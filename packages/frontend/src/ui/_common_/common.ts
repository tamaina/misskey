/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defineAsyncComponent } from 'vue';
import { host } from '@@/js/config.js';
import type { MenuItem } from '@/types/menu.js';
import * as os from '@/os.js';
import { instance } from '@/instance.js';
import { $i } from '@/i.js';
import { $locale, $l } from '@/i18n.js';

function toolsMenuItems(): MenuItem[] {
	const items: MenuItem[] = [{
		type: 'link',
		to: '/scratchpad',
		text: $locale.value.env.scratchpad,
		icon: 'ti ti-terminal-2',
	}, {
		type: 'link',
		to: '/api-console',
		text: 'API Console',
		icon: 'ti ti-terminal-2',
	}, {
		type: 'link',
		to: '/clicker',
		text: '🍪👈',
		icon: 'ti ti-cookie',
	}];

	if ($i && ($i.isAdmin || $i.policies.canManageCustomEmojis)) {
		items.push({
			type: 'link',
			to: '/custom-emojis-manager',
			text: $locale.value.env.manageCustomEmojis,
			icon: 'ti ti-icons',
		});
	}

	if ($i && ($i.isAdmin || $i.policies.canManageAvatarDecorations)) {
		items.push({
			type: 'link' as const,
			to: '/avatar-decorations',
			text: $locale.value.env.manageAvatarDecorations,
			icon: 'ti ti-sparkles',
		});
	}

	return items;
}

export function openInstanceMenu(ev: PointerEvent) {
	const menuItems: MenuItem[] = [];

	menuItems.push({
		text: instance.name ?? host,
		type: 'label',
	}, {
		type: 'link',
		text: $locale.value.env.instanceInfo,
		icon: 'ti ti-info-circle',
		to: '/about',
	}, {
		type: 'link',
		text: $locale.value.env.customEmojis,
		icon: 'ti ti-icons',
		to: '/about#emojis',
	});

	if (instance.federation !== 'none') {
		menuItems.push({
			type: 'link',
			text: $locale.value.env.federation,
			icon: 'ti ti-whirl',
			to: '/about#federation',
		});
	}

	menuItems.push({
		type: 'link',
		text: $locale.value.env.charts,
		icon: 'ti ti-chart-line',
		to: '/about#charts',
	}, { type: 'divider' }, {
		type: 'link',
		text: $locale.value.env.ads,
		icon: 'ti ti-ad',
		to: '/ads',
	});

	if ($i && ($i.isAdmin || $i.policies.canInvite) && instance.disableRegistration) {
		menuItems.push({
			type: 'link',
			to: '/invite',
			text: $locale.value.env.invite,
			icon: 'ti ti-user-plus',
		});
	}

	menuItems.push({
		type: 'parent',
		text: $locale.value.env.tools,
		icon: 'ti ti-tool',
		children: toolsMenuItems(),
	}, { type: 'divider' }, {
		type: 'link',
		text: $locale.value.env.inquiry,
		icon: 'ti ti-help-circle',
		to: '/contact',
	});

	if (instance.impressumUrl) {
		menuItems.push({
			type: 'a',
			text: $locale.value.env.impressum,
			icon: 'ti ti-file-invoice',
			href: instance.impressumUrl,
			target: '_blank',
		});
	}

	if (instance.tosUrl) {
		menuItems.push({
			type: 'a',
			text: $locale.value.env.termsOfService,
			icon: 'ti ti-notebook',
			href: instance.tosUrl,
			target: '_blank',
		});
	}

	if (instance.privacyPolicyUrl) {
		menuItems.push({
			type: 'a',
			text: $locale.value.env.privacyPolicy,
			icon: 'ti ti-shield-lock',
			href: instance.privacyPolicyUrl,
			target: '_blank',
		});
	}

	if (instance.impressumUrl != null || instance.tosUrl != null || instance.privacyPolicyUrl != null) {
		menuItems.push({ type: 'divider' });
	}

	menuItems.push({
		type: 'a',
		text: $locale.value.env.document,
		icon: 'ti ti-bulb',
		href: 'https://misskey-hub.net/docs/for-users/',
		target: '_blank',
	});

	if ($i) {
		menuItems.push({
			text: $locale.value.env._initialTutorial.launchTutorial,
			icon: 'ti ti-presentation',
			action: async () => {
				const { dispose } = await os.popupAsyncWithDialog(import('@/components/MkTutorialDialog.vue').then(x => x.default), {}, {
					closed: () => dispose(),
				});
			},
		});
	}

	menuItems.push({
		type: 'link',
		text: $locale.value.env.aboutMisskey,
		to: '/about-misskey',
	});

	os.popupMenu(menuItems, ev.currentTarget ?? ev.target, {
		align: 'left',
	});
}

export function openToolsMenu(ev: PointerEvent) {
	os.popupMenu(toolsMenuItems(), ev.currentTarget ?? ev.target, {
		align: 'left',
	});
}
