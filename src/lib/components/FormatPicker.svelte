<script lang="ts">
  import { outputFormat, conversionStatus } from '$lib/stores/conversion';
  import { getOutputFormats } from '$lib/utils/formats';

  let { mediaType }: { mediaType: string } = $props();

  let formats = $derived(getOutputFormats(mediaType as any));
  let selected = $derived($outputFormat);
  let status = $derived($conversionStatus);

  function onChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    $outputFormat = target.value;
  }
</script>

<select
  class="format-select {status !== 'idle' ? 'disabled' : ''}"
  value={selected}
  onchange={onChange}
  disabled={status !== 'idle'}
>
  <option value="" disabled>Select format...</option>
  {#each formats as format}
    <option value={format.value}>{format.label} (.{format.value})</option>
  {/each}
</select>

<style>
  .format-select {
    width: 100%;
    padding: 0.65rem 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.9rem;
    background: white;
    color: #1e293b;
    cursor: pointer;
    transition: border-color 0.2s;
    appearance: auto;
  }

  .format-select:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  .format-select.disabled {
    opacity: 0.5;
    cursor: default;
  }
</style>
