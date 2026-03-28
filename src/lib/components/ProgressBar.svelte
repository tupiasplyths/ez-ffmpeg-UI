<script lang="ts">
  import { progress, conversionStatus, errorMessage } from '$lib/stores/conversion';

  let pct = $derived($progress);
  let status = $derived($conversionStatus);
  let error = $derived($errorMessage);
</script>

{#if status === 'converting'}
  <div class="progress-container">
    <div class="progress-bar">
      <div class="progress-fill" style="width: {pct}%"></div>
    </div>
    <span class="progress-text">{pct}%</span>
  </div>
{:else if status === 'error'}
  <div class="error-container">
    <span class="error-text">{error}</span>
  </div>
{/if}

<style>
  .progress-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .progress-bar {
    flex: 1;
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #6366f1;
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.85rem;
    color: #6366f1;
    font-weight: 600;
    min-width: 3rem;
    text-align: right;
  }

  .error-container {
    padding: 0.75rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
  }

  .error-text {
    color: #dc2626;
    font-size: 0.85rem;
  }
</style>
