<template>
  <div class="table-container card">
    <div v-if="loading" class="status-box">
      <div class="spinner"></div>
      <p>Pobieranie indeksu paczek...</p>
    </div>

    <table v-else class="alpine-table">
      <thead>
        <tr>
          <th>Package</th>
          <th>Version</th>
          <th>Repository</th>
          <th>Architecture</th>
          <th>Maintainer</th>
          <th>Size (Inst.)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pkg in filteredPackages" :key="pkg.name + pkg.version">
          <td class="col-main">
            <a :href="`${rawUrlBase}${pkg.path}`" target="_blank">{{
              pkg.name
            }}</a>
          </td>
          <td class="col-version">{{ pkg.version }}</td>
          <td>
            <span class="text-accent">{{ pkg.repo }}</span>
          </td>
          <td>
            <code>{{ pkg.arch }}</code>
          </td>
          <td>
            <span class="maintainer-link">{{ pkg.maintainer }}</span>
          </td>
          <td class="text-dim">{{ formatSize(pkg.size) }}</td>
        </tr>
        <tr v-if="filteredPackages.length === 0">
          <td colspan="6" class="empty-state">No packages found.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { usePackages } from "../composables/usePackages";
const { filteredPackages, loading, rawUrlBase } = usePackages();

const formatSize = (bytes: number) => {
  if (!bytes) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (
    (bytes / Math.pow(1024, i)).toFixed(2) + " " + ["B", "KB", "MB", "GB"][i]
  );
};
</script>

<style scoped>
/* Tu zostaw swój CSS z .col-version, .col-main itd. */
.alpine-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.alpine-table th {
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid var(--border);
}
.alpine-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
}
.col-main a {
  color: var(--text-accent);
  text-decoration: none;
  font-weight: bold;
}
.col-version {
  color: #10b981;
  font-family: monospace;
}
.text-dim {
  color: var(--text-muted);
}
.text-accent {
  color: var(--text-accent);
}
code {
  background: #000;
  padding: 2px 5px;
  border-radius: 4px;
}
</style>
