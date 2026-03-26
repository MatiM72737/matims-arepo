import { ref, computed, watch } from "vue";
import pako from "pako";

export interface Package {
  name: string;
  version: string;
  repo: string;
  arch: string;
  maintainer: string;
  description: string;
  size: number;
  path: string;
}

const REPO_ID = "MatiM72737/matims-arepo";

// STAN GLOBALNY
const branches = ref<string[]>([]);
const selectedBranch = ref("main");
const selectedRepo = ref("");
const selectedArch = ref("");
const selectedMaintainer = ref("all");
const searchQuery = ref("");
const allPackages = ref<Package[]>([]);

// Listy dynamiczne wykryte z plików
const availableRepos = ref<string[]>([]);
const availableArchs = ref<string[]>([]);

const loading = ref(false);
const error = ref<string | null>(null);

export function usePackages() {
  // Funkcja skanująca strukturę plików na HF
  const scanStructure = async () => {
    try {
      const res = await fetch(
        `https://huggingface.co/api/datasets/${REPO_ID}/tree/${selectedBranch.value}?recursive=true`,
      );
      const files = await res.json();

      // Wyciągamy unikalne repozytoria i architektury na podstawie ścieżek plików APK
      const repos = new Set<string>();
      const archs = new Set<string>();

      files.forEach((f: any) => {
        if (f.path.endsWith(".apk")) {
          const parts = f.path.split("/");
          if (parts.length >= 3) {
            repos.add(parts[0]); // np. community
            archs.add(parts[1]); // np. x86_64
          }
        }
      });

      availableRepos.value = Array.from(repos).sort();
      availableArchs.value = Array.from(archs).sort();

      // Ustaw domyślne wartości, jeśli aktualne są puste lub już nie istnieją
      if (!availableRepos.value.includes(selectedRepo.value)) {
        selectedRepo.value = availableRepos.value[0] || "";
      }
      if (!availableArchs.value.includes(selectedArch.value)) {
        selectedArch.value = availableArchs.value[0] || "";
      }
    } catch (e) {
      console.error("Błąd skanowania struktury:", e);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await fetch(`https://huggingface.co/api/datasets/${REPO_ID}`);
      const data = await res.json();
      if (data.siblings) {
        branches.value = data.siblings
          .map((s: any) => (s.ref ? s.ref.replace("refs/heads/", "") : s.rbase))
          .filter(Boolean);
      }
      if (branches.value.length === 0) branches.value = ["main"];
    } catch (e) {
      branches.value = ["main"];
    }
  };

  const fetchData = async () => {
    // Nie strzelaj w API, jeśli nie mamy jeszcze wykrytych ścieżek
    if (!selectedRepo.value || !selectedArch.value) return;

    loading.value = true;
    error.value = null;
    try {
      const url = `https://huggingface.co/datasets/${REPO_ID}/resolve/${selectedBranch.value}/${selectedRepo.value}/${selectedArch.value}/APKINDEX.tar.gz`;
      const res = await fetch(url);

      if (!res.ok)
        throw new Error(
          `Brak indeksu w ${selectedRepo.value}/${selectedArch.value}`,
        );

      const buffer = await res.arrayBuffer();
      const decompressed = pako.ungzip(new Uint8Array(buffer));
      const text = new TextDecoder().decode(decompressed);

      allPackages.value = text
        .split("\n\n")
        .filter((block) => block.trim().length > 10)
        .map((block) => {
          const f: any = {};
          block.split("\n").forEach((line) => {
            if (line.length > 2) f[line[0]] = line.substring(2);
          });
          return {
            name: f["P"] || null,
            version: f["V"] || "0",
            description: f["T"] || "",
            arch: selectedArch.value,
            repo: selectedRepo.value,
            maintainer: f["m"] || "Unknown",
            size: parseInt(f["I"]) || 0,
            path: `${selectedRepo.value}/${selectedArch.value}/${f["P"]}-${f["V"]}.apk`,
          };
        })
        .filter((p) => p.name !== null);
    } catch (e: any) {
      error.value = e.message;
      allPackages.value = [];
    } finally {
      loading.value = false;
    }
  };

  const availableMaintainers = computed(() => {
    const maintainers = new Set(allPackages.value.map((p) => p.maintainer));
    return ["all", ...Array.from(maintainers)];
  });

  const filteredPackages = computed(() => {
    return allPackages.value.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase());
      const matchesMaintainer =
        selectedMaintainer.value === "all" ||
        p.maintainer === selectedMaintainer.value;
      return matchesSearch && matchesMaintainer;
    });
  });

  // Kiedy zmienisz branch, musimy od nowa przeskanować strukturę folderów
  watch(selectedBranch, async () => {
    await scanStructure();
    await fetchData();
  });

  // Zmiana filtrów repo/arch ładuje tylko nowy indeks
  watch([selectedRepo, selectedArch], fetchData);

  return {
    branches,
    selectedBranch,
    selectedRepo,
    selectedArch,
    selectedMaintainer,
    searchQuery,
    allPackages,
    filteredPackages,
    loading,
    error,
    availableRepos,
    availableArchs,
    availableMaintainers,
    fetchBranches,
    fetchData,
    scanStructure, // Dodajemy do zwrotu
    REPO_NAME: REPO_ID,
    rawUrlBase: computed(
      () =>
        `https://huggingface.co/datasets/${REPO_ID}/resolve/${selectedBranch.value}/`,
    ),
    copyToClipboard: () => {
      const url = `https://huggingface.co/datasets/${REPO_ID}/resolve/${selectedBranch.value}/${selectedRepo.value}`;
      navigator.clipboard.writeText(url);
      alert("URL skopiowany!");
    },
  };
}
