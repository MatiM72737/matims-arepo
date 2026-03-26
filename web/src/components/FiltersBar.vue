<template>
  <div class="filters-container card">
    <div class="filter-row">
      <div class="field">
        <label>Package name</label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="e.g. niri"
          class="search-input"
        />
      </div>
      <div class="field">
        <label>Branch</label>
        <select v-model="selectedBranch">
          <option v-for="b in branches" :key="b" :value="b">{{ b }}</option>
        </select>
      </div>
      <div class="field">
        <label>Repository</label>
        <select v-model="selectedRepo">
          <option v-for="r in availableRepos" :key="r" :value="r">
            {{ r }}
          </option>
        </select>
      </div>
      <div class="field">
        <label>Architecture</label>
        <select v-model="selectedArch">
          <option v-for="a in availableArchs" :key="a" :value="a">
            {{ a }}
          </option>
        </select>
      </div>
      <div class="field">
        <label>Maintainer</label>
        <select v-model="selectedMaintainer">
          <option v-for="m in availableMaintainers" :key="m" :value="m">
            {{ m }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePackages } from "../composables/usePackages";
const {
  branches,
  selectedBranch,
  selectedRepo,
  selectedArch,
  selectedMaintainer,
  searchQuery,
  availableRepos,
  availableArchs,
  availableMaintainers,
} = usePackages();
</script>

<style scoped>
.filter-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
  gap: 10px;
  padding: 15px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: bold;
}
input,
select {
  background: #111;
  border: 1px solid var(--border);
  color: white;
  padding: 8px;
  border-radius: 4px;
}
@media (max-width: 900px) {
  .filter-row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
