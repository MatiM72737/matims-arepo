<script setup lang="ts">
import { onMounted } from "vue";
import { usePackages } from "./composables/usePackages";
import AppHeader from "./components/AppHeader.vue";
import SetupInstructions from "./components/SetupInstructions.vue";
import FiltersBar from "./components/FiltersBar.vue";
import PackageTable from "./components/PackageTable.vue";
import "./assets/main.css";

const { fetchData, fetchBranches, scanStructure } = usePackages();

onMounted(async () => {
  await fetchBranches();
  await scanStructure();
  await fetchData();
});
</script>

<template>
  <div class="app-wrapper">
    <div class="container">
      <AppHeader />
      <main>
        <SetupInstructions />
        <FiltersBar />
        <PackageTable />
      </main>
      <footer class="main-footer">
        <p>MatiM72737 Arepo &copy; 2024 - Alpine Linux Custom Repository</p>
      </footer>
    </div>
  </div>
</template>
