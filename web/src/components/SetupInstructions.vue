<template>
  <section class="setup-section card">
    <div class="card-header">
      <h3>🚀 Quick System Setup</h3>
      <p>Add this repository to your Alpine Linux installation:</p>
    </div>
    <div class="command-box">
      <pre><code>{{ setupCommand }}</code></pre>
      <button @click="copyCommand" class="btn-secondary">Copy Command</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { usePackages } from "../composables/usePackages";

const { rawUrlBase, selectedRepo, availableRepos } = usePackages();

// Wyciągamy prawdziwe repozytoria (bez opcji "all")
const realRepos = computed(() =>
  availableRepos.value.filter((r) => r !== "all"),
);

// Dynamicznie generujemy komendę
const setupCommand = computed(() => {
  if (selectedRepo.value === "all") {
    // Generujemy osobną komendę dla każdego repozytorium
    return realRepos.value
      .map(
        (repo) =>
          `echo "${rawUrlBase.value}${repo}" | sudo tee -a /etc/apk/repositories`,
      )
      .join("\n");
  }

  // Jeśli wybrano jedno konkretne repozytorium
  return `echo "${rawUrlBase.value}${selectedRepo.value}" | sudo tee -a /etc/apk/repositories`;
});

const copyCommand = () => {
  navigator.clipboard.writeText(setupCommand.value);
  alert("Copied!");
};
</script>

<style scoped>
.command-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid var(--border);
}

/* Wymuszamy, żeby tekst zawijał się ładnie, jeśli jest za długi, ale trzymał entery */
.command-box pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: "Fira Code", monospace;
  color: #10b981;
  font-size: 13px;
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--text-accent);
  color: var(--text-accent);
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  margin-left: 15px;
}

.btn-secondary:hover {
  background: var(--text-accent);
  color: #000;
}
</style>
