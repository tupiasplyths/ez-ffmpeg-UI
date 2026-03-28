import { writable } from 'svelte/store';
import type { InputFile, ConversionStatus } from '$lib/types';

export const inputFile = writable<InputFile | null>(null);
export const outputFormat = writable<string>('');
export const conversionStatus = writable<ConversionStatus>('idle');
export const progress = writable<number>(0);
export const errorMessage = writable<string>('');
