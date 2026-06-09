/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import type { StoryObj } from '@storybook/vue3';
import { useLocale, useLocalizer } from 'virtual:vite-vue-internationalization';

const localeRef = useLocale(import.meta.url);
const localizerRef = useLocalizer(import.meta.url);
import MkEmojiPicker from './MkEmojiPicker.vue';
export const Default = {
	render(args) {
		return {
			components: {
				MkEmojiPicker,
			},
			setup() {
				return {
					args,
				};
			},
			computed: {
				props() {
					return {
						...this.args,
					};
				},
				events() {
					return {
						chosen: action('chosen'),
					};
				},
			},
			template: '<MkEmojiPicker v-bind="props" v-on="events" />',
		};
	},
	async play({ canvasElement }) {
		const canvas = within(canvasElement);
		const faceSection = canvas.getByText(/face/i);
		await waitFor(() => userEvent.click(faceSection));
		const grinning = canvasElement.querySelector('[data-emoji="😀"]');
		await expect(grinning).toBeInTheDocument();
		if (grinning == null) throw new Error(); // NOTE: not called
		await waitFor(() => userEvent.click(grinning));
		const recentUsedSection = canvas.getByText(new RegExp(localeRef.value.env.recentUsed)).parentElement;
		await expect(recentUsedSection).toBeInTheDocument();
		if (recentUsedSection == null) throw new Error(); // NOTE: not called
		await expect(within(recentUsedSection).getByAltText('😀')).toBeInTheDocument();
		await expect(within(recentUsedSection).queryByAltText('😬')).toEqual(null);
	},
	parameters: {
		layout: 'centered',
	},
} satisfies StoryObj<typeof MkEmojiPicker>;
