// src/composables/usePackages.ts
import { ref, computed, watch } from "vue";

export interface Package {
  path: string;
  sha: string;
  size: number;
  name: string; // np. "niri"
  version: string; // np. "0.1.0-r1"
  repo: string;
  arch: string;
  maintainer: string;
}

const REPO_ID = "MatiM72737/matims-arepo";

const branches = ref<string[]>([]);
const selectedBranch = ref("main");
const selectedRepo = ref("all");
const selectedArch = ref("all");
const selectedMaintainer = ref("all");
const searchQuery = ref("");
const allPackages = ref<Package[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

export function usePackages() {
  const fetchBranches = async () => {
    try {
      const res = await fetch(`https://huggingface.co/api/datasets/${REPO_ID}`);
      const data = await res.json();
      branches.value = data.siblings
        ? data.siblings.map(
            (s: any) => s.rbase || s.ref.replace("refs/heads/", ""),
          )
        : ["main"];
    } catch (e) {
      branches.value = ["main"];
    }
  };

  const fetchData = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(
        `https://huggingface.co/api/datasets/${REPO_ID}/tree/${selectedBranch.value}?recursive=true`,
      );
      if (!res.ok) throw new Error("Błąd pobierania danych.");
      const data = await res.json();

      allPackages.value = data
        .filter((f: any) => f.path.endsWith(".apk"))
        .map((f: any) => {
          const parts = f.path.split("/");
          const fullName = parts.pop() || "";

          // Regex do wyciągnięcia wersji (szuka pierwszego myślnika po którym następuje cyfra)
          // Przykład: niri-0.1.0-r1.apk -> [niri, 0.1.0-r1]
          const versionMatch = fullName.match(/^(.+?)-(\d.*)\.apk$/);
          const name = versionMatch
            ? versionMatch[1]
            : fullName.replace(".apk", "");
          const version = versionMatch ? versionMatch[2] : "unknown";

          return {
            ...f,
            name,
            version,
            arch: parts.length >= 1 ? parts[parts.length - 1] : "unknown",
            repo: parts.length >= 2 ? parts[0] : "root",
            maintainer: "MatiM", // Tutaj statycznie, dopóki nie masz metadanych
          };
        });
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  };

  watch(selectedBranch, fetchData);

  // Dynamiczne listy dla filtrów
  const availableRepos = computed(() => [
    "all",
    ...new Set(allPackages.value.map((p) => p.repo)),
  ]);
  const availableArchs = computed(() => [
    "all",
    ...new Set(allPackages.value.map((p) => p.arch)),
  ]);
  const availableMaintainers = computed(() => [
    "all",
    ...new Set(allPackages.value.map((p) => p.maintainer)),
  ]);

  const filteredPackages = computed(() => {
    return allPackages.value.filter((p) => {
      return (
        (selectedRepo.value === "all" || p.repo === selectedRepo.value) &&
        (selectedArch.value === "all" || p.arch === selectedArch.value) &&
        (selectedMaintainer.value === "all" ||
          p.maintainer === selectedMaintainer.value) &&
        p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });
  });

  return {
    branches,
    selectedBranch,
    selectedRepo,
    selectedArch,
    selectedMaintainer,
    searchQuery,
    filteredPackages,
    availableRepos,
    availableArchs,
    availableMaintainers,
    loading,
    error,
    rawUrlBase: computed(
      () =>
        `https://huggingface.co/datasets/${REPO_ID}/resolve/${selectedBranch.value}/`,
    ),
    fetchData,
    fetchBranches,
  };
}
