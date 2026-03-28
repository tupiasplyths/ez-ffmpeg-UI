<script lang="ts">
  import { conversionStatus } from '$lib/stores/conversion';

  let { isDragging = $bindable(false), onClick = () => {}, children }: {
    isDragging?: boolean;
    onClick: () => void;
    children: import('svelte').Snippet;
  } = $props();

  let status = $derived($conversionStatus);
  let interactive = $derived(status === 'idle');
</script>

<button
  type="button"
  class="drop-zone {isDragging ? 'dragging' : ''} {!interactive ? 'disabled' : ''}"
  onclick={interactive ? onClick : undefined}
>
  {@render children()}
</button>

<style>
  .drop-zone {
    width: 100%;
    min-height: 160px;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background: transparent;
    padding: 1.5rem;
    color: inherit;
    font-family: inherit;
    font-size: inherit;
  }

  .drop-zone:hover {
    border-color: #6366f1;
    background: #eef2ff;
  }

  .drop-zone.dragging {
    border-color: #6366f1;
    background: #e0e7ff;
    border-style: solid;
  }

  .drop-zone.disabled {
    cursor: default;
    opacity: 0.7;
    pointer-events: none;
  }
</style>
