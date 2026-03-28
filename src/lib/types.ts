export interface InputFile {
  path: string;
  name: string;
  extension: string;
  size: number;
}

export type ConversionStatus = 'idle' | 'converting' | 'done' | 'error';

export interface FormatOption {
  label: string;
  value: string;
  extensions: string[];
}
