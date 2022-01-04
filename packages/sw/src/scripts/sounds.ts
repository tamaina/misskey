import { get } from "idb-keyval"

export const defaultValues = {
	sound_note: 'syuilo/down',
	sound_noteMy: 'syuilo/up',
	sound_notification: 'syuilo/pope2',
	sound_chat: 'syuilo/pope1',
	sound_chatBg: 'syuilo/waon',
	sound_antenna: 'syuilo/triple',
	sound_channel: 'syuilo/square-pico',
	sound_reversiPutBlack: 'syuilo/kick',
	sound_reversiPutWhite: 'syuilo/snare',
};

async function getFileNameFromType(type: string, userId: string) {
	const state = await get(`pizzax::sound::cache::${userId}`);
	return (state && state[`sound_${type}`].type) || defaultValues[`sound_${type}`];
}

export async function getSoundUrl(type: string, userId: string) {
	return `/client-assets/sounds/${await getFileNameFromType(type, userId)}.mp3`;
}
