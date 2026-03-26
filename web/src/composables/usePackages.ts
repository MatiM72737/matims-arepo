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

// STAN GLOBALNY - Domyślnie ustawiamy na "all"
const branches = ref<string[]>([]);
const selectedBranch = ref("main");
const selectedRepo = ref("all");
const selectedArch = ref("all");
const selectedMaintainer = ref("all");
const searchQuery = ref("");
const allPackages = ref<Package[]>([]);

// Surowe listy wykryte z plików na HF
const availableReposRaw = ref<string[]>([]);
const availableArchsRaw = ref<string[]>([]);

const loading = ref(false);
const error = ref<string | null>(null);

export function usePackages() {
  // Listy dla Selectów - "all" jest zawsze pierwszą opcją
  const availableRepos = computed(() => ["all", ...availableReposRaw.value]);
  const availableArchs = computed(() => ["all", ...availableArchsRaw.value]);

  const scanStructure = async () => {
    try {
      const res = await fetch(
        `https://huggingface.co/api/datasets/${REPO_ID}/tree/${selectedBranch.value}?recursive=true`,
      );
      const files = await res.json();

      const repos = new Set<string>();
      const archs = new Set<string>();

      files.forEach((f: any) => {
        if (f.path.endsWith(".apk")) {
          const parts = f.path.split("/");
          if (parts.length >= 3) {
            repos.add(parts[0]);
            archs.add(parts[1]);
          }
        }
      });

      availableReposRaw.value = Array.from(repos).sort();
      availableArchsRaw.value = Array.from(archs).sort();

      // Upewniamy się, że jeśli ktoś miał wybrane coś, czego już nie ma, wracamy do "all"
      if (
        selectedRepo.value !== "all" &&
        !availableReposRaw.value.includes(selectedRepo.value)
      ) {
        selectedRepo.value = "all";
      }
      if (
        selectedArch.value !== "all" &&
        !availableArchsRaw.value.includes(selectedArch.value)
      ) {
        selectedArch.value = "all";
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
    loading.value = true;
    error.value = null;
    allPackages.value = []; // Czyścimy przed nowym pobieraniem

    // Ustalamy, co dokładnie musimy pobrać
    const reposToFetch =
      selectedRepo.value === "all"
        ? availableReposRaw.value
        : [selectedRepo.value];
    const archsToFetch =
      selectedArch.value === "all"
        ? availableArchsRaw.value
        : [selectedArch.value];

    // Budujemy listę zapytań
    const fetchPromises = [];

    for (const repo of reposToFetch) {
      for (const arch of archsToFetch) {
        const url = `https://huggingface.co/datasets/${REPO_ID}/resolve/${selectedBranch.value}/${repo}/${arch}/APKINDEX.tar.gz`;

        // Każde zapytanie obsługuje własne błędy, żeby brak jednego folderu nie wysadził reszty
        const fetchPromise = fetch(url)
          .then(async (res) => {
            if (!res.ok) return []; // Folder/indeks nie istnieje - ignorujemy

            const buffer = await res.arrayBuffer();
            const decompressed = pako.ungzip(new Uint8Array(buffer));
            const text = new TextDecoder().decode(decompressed);

            return text
              .split("\n\n")
              .map((block) => {
                const f: any = {};
                block.split("\n").forEach((line) => {
                  if (line.length > 2) f[line[0]] = line.substring(2);
                });

                if (!f["P"]) return null; // Ignoruj puste bloki i "Unknown"

                return {
                  name: f["P"],
                  version: f["V"] || "0",
                  description: f["T"] || "",
                  arch: arch, // Zapisujemy z jakiego to przyszło zapytania
                  repo: repo,
                  maintainer: f["m"] || "Unknown",
                  size: parseInt(f["I"]) || 0,
                  path: `${repo}/${arch}/${f["P"]}-${f["V"]}.apk`,
                };
              })
              .filter((p): p is Package => p !== null);
          })
          .catch(() => {
            return []; // W razie błędu sieciowego zwracamy pustą listę dla tego folderu
          });

        fetchPromises.push(fetchPromise);
      }
    }

    try {
      // Czekamy aż WSZYSTKIE pobierania się zakończą i spłaszczamy wyniki do jednej tablicy
      const results = await Promise.all(fetchPromises);
      allPackages.value = results.flat();
    } catch (e: any) {
      error.value = "Wystąpił błąd podczas pobierania paczek.";
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

  watch(selectedBranch, async () => {
    await scanStructure();
    await fetchData();
  });

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
    scanStructure,
    REPO_NAME: REPO_ID,
    rawUrlBase: computed(
      () =>
        `https://huggingface.co/datasets/${REPO_ID}/resolve/${selectedBranch.value}/`,
    ),
    copyToClipboard: () => {
      // Jeśli wybrano 'all', URL nie ma sensu w kontekście apk add, kopiujemy bazę
      const repoPath = selectedRepo.value === "all" ? "" : selectedRepo.value;
      const url = `https://huggingface.co/datasets/${REPO_ID}/resolve/${selectedBranch.value}/${repoPath}`;
      navigator.clipboard.writeText(url);
      alert("URL skopiowany!");
    },
  };
}
