/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'misskey-js';
import type { Ref } from 'vue';
import type { SoundType } from '@/utility/sound.js';
import type { SoundStore } from '@/preferences/def.js';
import { getSoundDuration, playMisskeySfxFile, soundsTypes } from '@/utility/sound.js';
import * as os from '@/os.js';
import { useLocale, useLocalizer } from 'virtual:vite-vue-internationalization';

const $locale = useLocale(import.meta.url);
const $l = useLocalizer(import.meta.url);

export async function soundSettingsButton(soundSetting: Ref<SoundStore>): Promise<void> {
	function getSoundTypeName(f: SoundType): string {
		switch (f) {
			case null:
				return $locale.value.env.none;
			case '_driveFile_':
				return $locale.value.env._soundSettings.driveFile;
			default:
				return f;
		}
	}

	const { canceled, result } = await os.form($locale.value.env.sound, {
		type: {
			type: 'enum',
			label: $locale.value.env.sound,
			default: soundSetting.value.type ?? 'none',
			enum: soundsTypes.map(f => ({
				value: f ?? 'none' as Exclude<SoundType, null> | 'none',
				label: getSoundTypeName(f),
			})),
		},
		soundFile: {
			type: 'drive-file',
			label: $locale.value.env.file,
			defaultFileId: soundSetting.value.type === '_driveFile_' ? soundSetting.value.fileId : null,
			hidden: v => v.type !== '_driveFile_',
			validate: async (file: Misskey.entities.DriveFile) => {
				if (!file.type.startsWith('audio')) {
					os.alert({
						type: 'warning',
						title: $locale.value.env._soundSettings.driveFileTypeWarn,
						text: $locale.value.env._soundSettings.driveFileTypeWarnDescription,
					});
					return false;
				}

				const duration = await getSoundDuration(file.url);
				if (duration >= 2000) {
					const { canceled } = await os.confirm({
						type: 'warning',
						title: $locale.value.env._soundSettings.driveFileDurationWarn,
						text: $locale.value.env._soundSettings.driveFileDurationWarnDescription,
						okText: $locale.value.env.continue,
						cancelText: $locale.value.env.cancel,
					});
					if (canceled) return false;
				}

				return true;
			},
		},
		volume: {
			type: 'range',
			label: $locale.value.env.volume,
			default: soundSetting.value.volume ?? 1,
			textConverter: (v) => `${Math.floor(v * 100)}%`,
			min: 0,
			max: 1,
			step: 0.05,
		},
		listen: {
			type: 'button',
			content: $locale.value.env.listen,
			action: (_, v) => {
				const sound = buildSoundStore(v);
				if (!sound) return;
				playMisskeySfxFile(sound);
			},
		},
	});

	if (canceled) return;

	const res = buildSoundStore(result);
	if (res) soundSetting.value = res;

	function buildSoundStore(r: NonNullable<typeof result>): SoundStore | null {
		const type = (r.type === 'none' ? null : r.type);
		const volume = r.volume;
		const fileId = r.soundFile?.id ?? (soundSetting.value.type === '_driveFile_' ? soundSetting.value.fileId : undefined);
		const fileUrl = r.soundFile?.url ?? (soundSetting.value.type === '_driveFile_' ? soundSetting.value.fileUrl : undefined);

		if (type === '_driveFile_') {
			if (!fileUrl || !fileId) {
				os.alert({
					type: 'warning',
					text: $locale.value.env._soundSettings.driveFileWarn,
				});
				return null;
			}
			return { type, volume, fileId, fileUrl };
		} else {
			return { type, volume };
		}
	}
}
