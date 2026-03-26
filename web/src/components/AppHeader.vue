<template>
  <header class="main-header">
    <div class="logo-area">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 4L3 18H21L12 4Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M9 14L12 9L15 14"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="title-group">
        <h1>MatiM Arepo</h1>
        <p class="subtitle">Custom Alpine Linux Package Repository</p>
      </div>
    </div>
    <nav class="header-links">
      <a :href="`https://huggingface.co/datasets/${REPO_NAME}`" target="_blank"
        >Dataset Info</a
      >
      <a href="https://github.com/matim72737/matims-arepo" target="_blank"
        >GitHub</a
      >
    </nav>
  </header>
</template>

<script setup lang="ts">
import { usePackages } from "../composables/usePackages";
const { REPO_NAME } = usePackages();
</script>
