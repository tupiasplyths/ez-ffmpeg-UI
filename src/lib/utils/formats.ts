import type { FormatOption } from '$lib/types';

const videoFormats: FormatOption[] = [
  { label: 'MP4', value: 'mp4', extensions: ['.mp4'] },
  { label: 'MKV', value: 'mkv', extensions: ['.mkv'] },
  { label: 'WebM', value: 'webm', extensions: ['.webm'] },
  { label: 'AVI', value: 'avi', extensions: ['.avi'] },
  { label: 'MOV', value: 'mov', extensions: ['.mov'] },
];

const audioFormats: FormatOption[] = [
  { label: 'MP3', value: 'mp3', extensions: ['.mp3'] },
  { label: 'WAV', value: 'wav', extensions: ['.wav'] },
  { label: 'AAC', value: 'aac', extensions: ['.aac'] },
  { label: 'FLAC', value: 'flac', extensions: ['.flac'] },
  { label: 'OGG', value: 'ogg', extensions: ['.ogg'] },
  { label: 'M4A', value: 'm4a', extensions: ['.m4a'] },
];

const videoExtensions = new Set([
  '.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.mpg', '.mpeg',
  '.3gp', '.ts', '.mts', '.m2ts',
]);

const audioExtensions = new Set([
  '.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a', '.wma', '.opus', '.aiff', '.ape',
]);

export type MediaType = 'video' | 'audio' | 'unknown';

export function detectMediaType(extension: string): MediaType {
  const ext = extension.toLowerCase();
  if (videoExtensions.has(ext)) return 'video';
  if (audioExtensions.has(ext)) return 'audio';
  return 'unknown';
}

export function getOutputFormats(mediaType: MediaType): FormatOption[] {
  switch (mediaType) {
    case 'video':
      return [...videoFormats, ...audioFormats];
    case 'audio':
      return audioFormats;
    default:
      return [...videoFormats, ...audioFormats];
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
