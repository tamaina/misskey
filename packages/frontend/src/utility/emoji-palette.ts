/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { prefer } from '@/preferences.js';
import * as os from '@/os.js';
import { useLocale, useLocalizer } from 'virtual:vite-vue-internationalization';

const localeRef = useLocale(import.meta.url);
const localizerRef = useLocalizer(import.meta.url);
import type { MkSelectItem } from '@/components/MkSelect.vue';

export function chooseEmojiPalette() {
	return os.select({
		title: localeRef.value.env.chooseEmojiPalette,
		default: prefer.s.emojiPaletteForMain ?? prefer.s.emojiPaletteForReaction ?? prefer.s.emojiPalettes[0]?.id,
		items: prefer.s.emojiPalettes.map<MkSelectItem<string>>((palette) => {
			let caption: string | undefined = undefined;

			if (prefer.s.emojiPaletteForMain === palette.id) {
				caption = localeRef.value.env._emojiPalette.paletteForMain;
			} else if (prefer.s.emojiPaletteForReaction === palette.id) {
				caption = localeRef.value.env._emojiPalette.paletteForReaction;
			}

			return {
				label: palette.name || `(${localeRef.value.env.noName})`,
				caption,
				value: palette.id,
			};
		}),
	});
}

export async function addToEmojiPalette(emoji: string) {
	const res = await chooseEmojiPalette();

	if (res.canceled || res.result == null) return;

	const palette = prefer.s.emojiPalettes.find((p) => p.id === res.result);
	if (!palette) return;
	let emojis = [...palette.emojis];

	if (!emojis.includes(emoji)) {
		emojis.push(emoji);
		prefer.commit('emojiPalettes', prefer.s.emojiPalettes.map((p) => {
			if (p.id === palette.id) {
				return {
					...p,
					emojis,
				};
			} else {
				return p;
			}
		}));
		os.success();
	} else {
		const res = await os.actions({
			type: 'warning',
			text: localeRef.value.env.emojiPaletteAlreadyAddedConfirm,
			actions: [{
				value: 'prepend',
				text: localeRef.value.env.prepend,
			}, {
				value: 'append',
				text: localeRef.value.env.append,
			}, {
				value: 'doNothing',
				text: localeRef.value.env.doNothing,
			}],
		});

		if (res.canceled || res.result === 'doNothing') return;

		emojis = emojis.filter((e) => e !== emoji);

		if (res.result === 'append') {
			emojis.push(emoji);
		} else if (res.result === 'prepend') {
			emojis.unshift(emoji);
		}

		prefer.commit('emojiPalettes', prefer.s.emojiPalettes.map((p) => {
			if (p.id === palette.id) {
				return {
					...p,
					emojis,
				};
			} else {
				return p;
			}
		}));

		os.success();
	}
}
