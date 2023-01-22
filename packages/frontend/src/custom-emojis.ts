import { apiGet } from './os';
import { miLocalStorage } from './local-storage';
import { shallowRef, computed, markRaw } from 'vue';
import * as Misskey from 'misskey-js';

const storageCache = miLocalStorage.getItem('emojis');
export let customEmojis: {
	name: string;
	aliases: string[];
	category: string;
	url: string;
}[] = storageCache ? JSON.parse(storageCache) : [];

export async function fetchCustomEmojis() {
	const now = Date.now();
	const lastFetchedAt = miLocalStorage.getItem('lastEmojisFetchedAt');
	if (lastFetchedAt && (now - parseInt(lastFetchedAt)) < 1000 * 60 * 60 * 24) return;

	const res = await apiGet('emojis', {});

	customEmojis.value = res.emojis;
	miLocalStorage.setItem('emojis', JSON.stringify(res.emojis));
	miLocalStorage.setItem('lastEmojisFetchedAt', now.toString());
}

let cachedTags;
export function getCustomEmojiTags() {
	if (cachedTags) return cachedTags;

	const tags = new Set();
	for (const emoji of customEmojis.value) {
		for (const tag of emoji.aliases) {
			tags.add(tag);
		}
	}
	const res = Array.from(tags);
	cachedTags = res;
	return res;
}
