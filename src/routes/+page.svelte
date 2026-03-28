<script lang="ts">
  import { invoke } from '@tauri-apps/api/core';
  import { listen, type UnlistenFn } from '@tauri-apps/api/event';
  import { open, save } from '@tauri-apps/plugin-dialog';
  import DropZone from '$lib/components/DropZone.svelte';
  import FormatPicker from '$lib/components/FormatPicker.svelte';
  import ConvertButton from '$lib/components/ConvertButton.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import { inputFile, outputFormat, conversionStatus, progress, errorMessage } from '$lib/stores/conversion';
  import { detectMediaType } from '$lib/utils/formats';
  import type { InputFile } from '$lib/types';

  let isDragging = $state(false);
  let mediaType = $state('unknown');

  $effect(() => {
    const file = $inputFile;
    if (file) {
      mediaType = detectMediaType(file.extension);
    } else {
      mediaType = 'unknown';
    }
  });

  function setFile(path: string) {
    const name = path.split(/[\\/]/).pop() || '';
    const lastDot = name.lastIndexOf('.');
    const baseName = lastDot > 0 ? name.slice(0, lastDot) : name;
    const extension = lastDot > 0 ? name.slice(lastDot) : '';

    $inputFile = {
      path,
      name: baseName,
      extension,
      size: 0,
    };
    $outputFormat = '';
    $progress = 0;
    $errorMessage = '';
    $conversionStatus = 'idle';
  }

  async function handleBrowse() {
    const selected = await open({
      multiple: false,
      title: 'Select media file',
    });
    if (selected && typeof selected === 'string') {
      setFile(selected);
    }
  }

  async function handleConvert() {
    if (!$inputFile || !$outputFormat) return;

    try {
      const outputPath = await save({
        defaultPath: `${$inputFile.name}.${$outputFormat}`,
        filters: [{ name: $outputFormat.toUpperCase(), extensions: [$outputFormat] }],
      });

      if (!outputPath) return;

      $conversionStatus = 'converting';
      $progress = 0;
      $errorMessage = '';

      await invoke('convert_file', {
        input: $inputFile.path,
        output: outputPath,
      });
    } catch (e) {
      $conversionStatus = 'error';
      $errorMessage = String(e);
    }
  }

  function handleReset() {
    $inputFile = null;
    $outputFormat = '';
    $conversionStatus = 'idle';
    $progress = 0;
    $errorMessage = '';
  }

  onMount(async () => {
    const unlistenDragEnter = await listen('tauri://drag-enter', () => {
      isDragging = true;
    });
    const unlistenDragLeave = await listen('tauri://drag-leave', () => {
      isDragging = false;
    });
    const unlistenDrop = await listen<{ paths: string[] }>('tauri://drag-drop', (event) => {
      isDragging = false;
      const path = event.payload.paths[0];
      if (path) setFile(path);
    });
    const unlistenProgress = await listen<number>('conversion-progress', (event) => {
      $progress = event.payload;
    });
    const unlistenDone = await listen('conversion-done', () => {
      $conversionStatus = 'done';
    });
    const unlistenError = await listen<string>('conversion-error', (event) => {
      $conversionStatus = 'error';
      $errorMessage = event.payload;
    });

    return () => {
      unlistenDragEnter();
      unlistenDragLeave();
      unlistenDrop();
      unlistenProgress();
      unlistenDone();
      unlistenError();
    };
  });
</script>

<main class="app-container">
  <h1 class="title">ez-ffmpeg</h1>
  <p class="subtitle">Drop a file. Pick a format. Convert.</p>

  <div class="card">
    {#if $conversionStatus === 'done' || $conversionStatus === 'error'}
      <div class="actions">
        <button class="reset-btn" onclick={handleReset}>
          {$conversionStatus === 'done' ? 'Convert another file' : 'Try again'}
        </button>
      </div>
    {/if}

    <DropZone bind:isDragging onClick={handleBrowse}>
      {#if $inputFile}
        <div class="file-info">
          <svg xmlns="http://www.w3.org/2000/svg" class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <div class="file-details">
            <span class="file-name">{$inputFile.name}{$inputFile.extension}</span>
            <span class="file-meta">{$inputFile.extension.toUpperCase().slice(1)} &middot; {$inputFile.path}</span>
          </div>
        </div>
      {:else if $conversionStatus === 'done'}
        <div class="done-info">
          <svg xmlns="http://www.w3.org/2000/svg" class="done-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>Conversion complete!</span>
        </div>
      {:else}
        <div class="placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span class="drop-text">Drop file here or click to browse</span>
        </div>
      {/if}
    </DropZone>

    {#if $inputFile && $conversionStatus === 'idle'}
      <div class="controls">
        <label class="format-label">Convert to</label>
        <FormatPicker {mediaType} />
        <ConvertButton onClick={handleConvert} />
      </div>
    {/if}

    <ProgressBar />
  </div>
</main>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 1.5rem;
    min-height: 100vh;
    background: #f8fafc;
    color: #1e293b;
  }

  .title {
    font-size: 1.75rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.025em;
  }

  .subtitle {
    color: #94a3b8;
    margin: 0.25rem 0 1.5rem;
    font-size: 0.9rem;
  }

  .card {
    width: 100%;
    max-width: 420px;
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .format-label {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
  }

  .actions {
    margin-bottom: 1rem;
    text-align: center;
  }

  .reset-btn {
    padding: 0.5rem 1rem;
    background: transparent;
    color: #6366f1;
    border: 1px solid #6366f1;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .reset-btn:hover {
    background: #6366f1;
    color: white;
  }

  .placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .upload-icon {
    width: 3rem;
    height: 3rem;
    color: #94a3b8;
  }

  .drop-text {
    color: #94a3b8;
    font-size: 0.95rem;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .file-icon {
    width: 2.5rem;
    height: 2.5rem;
    color: #6366f1;
    flex-shrink: 0;
  }

  .file-details {
    display: flex;
    flex-direction: column;
    text-align: left;
    overflow: hidden;
  }

  .file-name {
    font-weight: 600;
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-meta {
    color: #94a3b8;
    font-size: 0.75rem;
    margin-top: 0.2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .done-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #22c55e;
    font-weight: 500;
  }

  .done-icon {
    width: 2.5rem;
    height: 2.5rem;
  }
</style>
