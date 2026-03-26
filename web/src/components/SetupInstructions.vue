<template>
  <section class="setup-section card">
    <div class="card-header">
      <h3>🚀 Quick System Setup</h3>
      <p>Add this repository to your Alpine Linux installation:</p>
    </div>
    <div class="command-box">
      <code
        >echo "{{ rawUrlBase }}{{ selectedRepo }}" | sudo tee -a
        /etc/apk/repositories</code
      >
      <button @click="copyToClipboard" class="btn-secondary">Copy URL</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { usePackages } from "../composables/usePackages";
const { rawUrlBase, selectedRepo, copyToClipboard } = usePackages();
</script>
