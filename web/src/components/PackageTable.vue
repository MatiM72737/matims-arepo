<template>
  <div v-if="loading" class="status-box"><div class="spinner"></div></div>

  <div v-else class="table-wrapper card">
    <table class="alpine-table">
      <thead>
        <tr>
          <th>Package</th>
          <th>Version</th>
          <th>Branch</th>
          <th>Repository</th>
          <th>Architecture</th>
          <th>Maintainer</th>
          <th>Size</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pkg in filteredPackages" :key="pkg.sha">
          <td class="col-main">
            <a :href="`${rawUrlBase}${pkg.path}`" target="_blank">{{
              pkg.name
            }}</a>
          </td>
          <td class="col-version">{{ pkg.version }}</td>
          <td>
            <span class="text-dim">{{ selectedBranch }}</span>
          </td>
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
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { usePackages } from "../composables/usePackages";
const { filteredPackages, loading, rawUrlBase, selectedBranch } = usePackages();

const formatSize = (b: number) => {
  if (!b) return "0 B";
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return `${(b / Math.pow(1024, i)).toFixed(2)} ${["B", "KB", "MB", "GB"][i]}`;
};
</script>

<style scoped>
.alpine-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.alpine-table th {
  background: #1a1a1a;
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
.maintainer-link {
  color: #38bdf8;
  cursor: pointer;
}
.maintainer-link:hover {
  text-decoration: underline;
}
</style>
