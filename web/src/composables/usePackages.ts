// src/composables/usePackages.ts
import { ref, computed, watch } from "vue";

export interface Package {
  path: string;
  sha: string;
  size: number;
  name: string;
  repo: string;
  arch: string;
}

const REPO_ID = "MatiM72737/matims-arepo";

// Stan globalny (dzielony między komponenty)
const branches = ref<string[]>([]);
const selectedBranch = ref("main");
const selectedRepo = ref("all");
const searchQuery = ref("");
const allPackages = ref<Package[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

export function usePackages() {
  // 1. Pobieranie dostępnych branchy bezpośrednio z HF
  const fetchBranches = async () => {
    try {
      const res = await fetch(`https://huggingface.co/api/datasets/${REPO_ID}`);
      const data = await res.json();
      // Wyciągamy nazwy wszystkich branchy (sibiling refs)
      if (data.siblings) {
        branches.value = data.siblings.map(
          (s: any) => s.rbase || s.ref.replace("refs/heads/", ""),
        );
      } else {
        branches.value = ["main"];
      }
    } catch (e) {
      console.error("Failed to fetch branches", e);
      branches.value = ["main"];
    }
  };

  // 2. Pobieranie plików i parsowanie struktury (repo/arch/pkg)
  const fetchData = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(
        `https://huggingface.co/api/datasets/${REPO_ID}/tree/${selectedBranch.value}?recursive=true`,
      );
      if (!res.ok) throw new Error("Nie udało się pobrać listy plików.");

      const data = await res.json();

      allPackages.value = data
        .filter((f: any) => f.path.endsWith(".apk"))
        .map((f: any) => {
          const parts = f.path.split("/");
          // Przykład: community/x86_64/niri-0.1.0.apk
          // parts[0] = community, parts[1] = x86_64, parts[2] = niri...
          return {
            ...f,
            name: parts[parts.length - 1],
            arch: parts.length > 2 ? parts[parts.length - 2] : "unknown",
            repo: parts.length > 1 ? parts[0] : "root",
          };
        });
    } catch (e: any) {
      error.value = e.message;
      allPackages.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Automatyczne odświeżanie przy zmianie brancha
  watch(selectedBranch, fetchData);

  // Dynamiczna lista repozytoriów na podstawie tego, co faktycznie jest w plikach
  const availableRepos = computed(() => {
    const repos = new Set(allPackages.value.map((p) => p.repo));
    return ["all", ...Array.from(repos)];
  });

  // Filtrowanie końcowe
  const filteredPackages = computed(() => {
    return allPackages.value.filter((p) => {
      const matchesRepo =
        selectedRepo.value === "all" || p.repo === selectedRepo.value;
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase());
      return matchesRepo && matchesSearch;
    });
  });

  const rawUrlBase = computed(
    () =>
      `https://huggingface.co/datasets/${REPO_ID}/resolve/${selectedBranch.value}/`,
  );

  return {
    branches,
    selectedBranch,
    selectedRepo,
    searchQuery,
    filteredPackages,
    availableRepos,
    loading,
    error,
    rawUrlBase,
    fetchData,
    fetchBranches,
    REPO_ID,
  };
}
