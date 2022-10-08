import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export interface Settings {
	GitHubPersonalAccessToken: string;
}

const provider = browser ? localStorage : null;

export const settingStore = writable<Settings>(JSON.parse(provider?.getItem('settings') || '{}'));

settingStore.subscribe((newValue) => {
	provider?.setItem('settings', JSON.stringify(newValue));
});
