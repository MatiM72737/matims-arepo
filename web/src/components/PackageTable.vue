<template>
  <div v-if="loading" class="status-box">
    <div class="spinner"></div>
    <p>Pobieranie danych z Hugging Face...</p>
  </div>

  <div v-else class="table-container card">
    <table>
      <thead>
        <tr>
          <th>Paczka</th>
          <th>Repozytorium</th>
          <th>Architektura</th>
          <th>Rozmiar</th>
          <th>Akcja</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pkg in filteredPackages" :key="pkg.sha">
          <td class="pkg-name">{{ pkg.name }}</td>
          <td>
            <span class="badge">{{ pkg.repo }}</span>
          </td>
          <td>
            <code>{{ pkg.arch }}</code>
          </td>
          <td>{{ formatSize(pkg.size) }}</td>
          <td>
            <a
              :href="`${rawUrlBase}${pkg.path}`"
              class="btn-primary"
              target="_blank"
              >Pobierz</a
            >
          </td>
        </tr>
        <tr v-if="filteredPackages.length === 0">
          <td
            colspan="5"
            style="text-align: center; padding: 3rem; color: var(--text-muted)"
          >
            Nie znaleziono paczek dla wybranych filtrów.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { usePackages } from "../composables/usePackages";
const { filteredPackages, loading, rawUrlBase } = usePackages();

const formatSize = (b: number) => {
  if (!b) return "0 B";
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return `${(b / Math.pow(1024, i)).toFixed(2)} ${["B", "KB", "MB", "GB"][i]}`;
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th {
  text-align: left;
  padding: 1rem;
  border-bottom: 2px solid var(--border);
  color: var(--text-muted);
  font-size: 0.9rem;
}
td {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}
.pkg-name {
  font-weight: 600;
  color: var(--text-accent);
}
.badge {
  background: var(--btn-secondary);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}
</style>
