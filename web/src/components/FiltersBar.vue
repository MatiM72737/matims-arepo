<template>
  <div class="filters-wrapper card">
    <div class="filter-grid">
      <div class="filter-item">
        <label>Branch</label>
        <select v-model="selectedBranch">
          <option v-for="b in branches" :key="b" :value="b">{{ b }}</option>
        </select>
      </div>

      <div class="filter-item">
        <label>Repository</label>
        <select v-model="selectedRepo">
          <option v-for="r in availableRepos" :key="r" :value="r">
            {{ r === "all" ? "Wszystkie" : r }}
          </option>
        </select>
      </div>

      <div class="filter-item search">
        <label>Szukaj paczki</label>
        <input v-model="searchQuery" placeholder="np. niri..." type="text" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePackages } from "../composables/usePackages";
const { branches, selectedBranch, selectedRepo, availableRepos, searchQuery } =
  usePackages();
</script>

<style scoped>
.filter-grid {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  flex-wrap: wrap;
}
.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.filter-item label {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: bold;
  text-transform: uppercase;
}
select,
input {
  background: var(--bg-app);
  border: 1px solid var(--border);
  color: white;
  padding: 0.6rem;
  border-radius: 6px;
  min-width: 150px;
}
.search {
  flex: 1;
}
</style>
