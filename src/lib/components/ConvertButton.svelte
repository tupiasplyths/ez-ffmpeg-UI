<script lang="ts">
  import { conversionStatus, inputFile, outputFormat } from '$lib/stores/conversion';

  let { onClick = () => {} }: { onClick: () => void } = $props();

  let status = $derived($conversionStatus);
  let canConvert = $derived(
    status === 'idle' && $inputFile !== null && $outputFormat !== ''
  );
</script>

<button
  class="convert-btn"
  disabled={!canConvert}
  onclick={canConvert ? onClick : undefined}
>
  {status === 'converting' ? 'Converting...' : 'Convert'}
</button>

<style>
  .convert-btn {
    width: 100%;
    padding: 0.75rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .convert-btn:hover:not(:disabled) {
    background: #4f46e5;
  }

  .convert-btn:active:not(:disabled) {
    background: #4338ca;
  }

  .convert-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
