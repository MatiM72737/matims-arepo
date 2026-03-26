<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

// Oznaczamy typ danych dla paczki
interface Package {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size: number;
}

// Reaktywne zmienne
const allPackages = ref<Package[]>([]);
const searchQuery = ref("");
const loading = ref(true);
const error = ref<string | null>(null);

// Stałe konfiguracyjne
const REPO_NAME = "MatiM/matims-arepo";
const API_URL = `https://huggingface.co/api/datasets/${REPO_NAME}/tree/main?recursive=true`;
const RAW_URL_BASE = `https://huggingface.co/datasets/${REPO_NAME}/resolve/main`;

// Funkcja pobierająca dane z API Hugging Face
const fetchData = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();

    // Filtrujemy tylko pliki z rozszerzeniem .apk
    allPackages.value = data.filter((file: any) => file.path.endsWith(".apk"));
  } catch (e) {
    console.error("Failed to fetch packages:", e);
    error.value = "Could not load packages. Please try again later.";
  } finally {
    loading.value = false;
  }
};

// Computed property: filtruje paczki na podstawie wpisanej frazy
const filteredPackages = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return allPackages.value;

  return allPackages.value.filter((pkg) =>
    pkg.path.toLowerCase().includes(query),
  );
});

// Funkcja pomocnicza do wyciągania samej nazwy pliku ze ścieżki
const getFileName = (path: string) => {
  return path.split("/").pop() || path;
};

// Funkcja pomocnicza do formatowania rozmiaru pliku
const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Funkcja kopiująca URL repozytorium do schowka
const copyToClipboard = () => {
  navigator.clipboard
    .writeText(RAW_URL_BASE)
    .then(() => alert("Repository URL copied to clipboard!"))
    .catch((err) => console.error("Failed to copy:", err));
};

// Pobierz dane zaraz po zamontowaniu komponentu
onMounted(fetchData);
</script>

<template>
  <div class="app-wrapper">
    <div class="container">
      <header class="main-header">
        <div class="logo-area">
          <span class="logo-icon">🐢</span>
          <div class="title-group">
            <h1>MatiM Arepo</h1>
            <p class="subtitle">Custom Alpine Linux Package Repository</p>
          </div>
        </div>
        <div class="header-links">
          <a
            :href="`https://huggingface.co/datasets/${REPO_NAME}`"
            target="_blank"
            class="text-link"
            >Dataset Info</a
          >
          <a
            href="https://github.com/MatiM/matims-arepo-webpage"
            target="_blank"
            class="text-link"
            >GitHub</a
          >
        </div>
      </header>

      <main>
        <section class="setup-section card">
          <div class="card-header">
            <h3>🚀 Quick System Setup</h3>
            <p>
              Add this repository to your Alpine Linux installation by running:
            </p>
          </div>
          <div class="command-box">
            <code
              >echo "{{ RAW_URL_BASE }}" >> /etc/apk/repositories && apk
              update</code
            >
            <button
              @click="copyToClipboard"
              class="btn-secondary"
              title="Copy repository URL"
            >
              Copy URL
            </button>
          </div>
        </section>

        <section class="packages-section">
          <div class="section-header">
            <h2>Available Packages</h2>
            <div class="search-wrapper">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by package name (e.g. niri, hyprland)..."
                class="search-bar"
              />
              <span class="package-count">
                {{ filteredPackages.length }} of {{ allPackages.length }} APKs
              </span>
            </div>
          </div>

          <div v-if="loading" class="status-box">
            <div class="spinner"></div>
            <p>Fetching latest package index from Hugging Face...</p>
          </div>

          <div v-else-if="error" class="status-box error-box">
            <p>⚠️ {{ error }}</p>
          </div>

          <div v-else class="package-grid">
            <div
              v-for="pkg in filteredPackages"
              :key="pkg.sha"
              class="package-card card"
            >
              <div class="pkg-main-info">
                <span class="pkg-title">{{ getFileName(pkg.path) }}</span>
                <span class="pkg-path">{{ pkg.path }}</span>
              </div>
              <div class="pkg-meta">
                <span class="pkg-size">{{ formatSize(pkg.size) }}</span>
                <a
                  :href="`${RAW_URL_BASE}/${pkg.path}`"
                  class="btn-primary download-btn"
                  target="_blank"
                >
                  Download
                </a>
              </div>
            </div>

            <div
              v-if="filteredPackages.length === 0"
              class="status-box empty-box"
            >
              <p>
                No packages match your search query: "<strong>{{
                  searchQuery
                }}</strong
                >"
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer class="main-footer">
        <p>Maintained with precision by MatiM.</p>
        <p>Powered by Hugging Face Datasets & Vue 3.</p>
      </footer>
    </div>
  </div>
</template>

<style>
/* --- CSS Variables & Reset --- */
:root {
  --bg-app: #0f172a;
  --bg-card: #1e293b;
  --bg-code: #000000;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --text-accent: #38bdf8; /* Alpine-like Blue */
  --text-success: #10b981;
  --border: #334155;
  --btn-primary: #38bdf8;
  --btn-primary-hover: #7dd3fc;
  --btn-secondary: #334155;
  --btn-secondary-hover: #475569;
}

body {
  background-color: var(--bg-app);
  color: var(--text-main);
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    sans-serif;
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* --- Layout Utilities --- */
.app-wrapper {
  padding: 1rem;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* --- Commmon Components --- */
.card {
  background-color: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-primary {
  background-color: var(--btn-primary);
  color: #000;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s;
  display: inline-block;
}

.btn-primary:hover {
  background-color: var(--btn-primary-hover);
}

.btn-secondary {
  background-color: var(--btn-secondary);
  color: var(--text-main);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background-color: var(--btn-secondary-hover);
}

.text-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.text-link:hover {
  color: var(--text-accent);
}

/* --- Header --- */
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4rem;
}

.logo-area {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.logo-icon {
  font-size: 3rem;
}

.title-group h1 {
  margin: 0;
  font-size: 2.5rem;
  color: var(--text-accent);
  letter-spacing: -1px;
}

.subtitle {
  margin: 0;
  color: var(--text-muted);
  font-size: 1.1rem;
}

.header-links {
  display: flex;
  gap: 1.5rem;
}

/* --- Setup Section --- */
.setup-section {
  padding: 2rem;
  margin-bottom: 3rem;
}

.setup-section .card-header {
  margin-bottom: 1.5rem;
}

.setup-section h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.4rem;
}

.setup-section p {
  margin: 0;
  color: var(--text-muted);
}

.command-box {
  background-color: var(--bg-code);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.command-box code {
  font-family: "Fira Code", "Courier New", monospace;
  color: var(--text-success);
  font-size: 0.95rem;
  overflow-x: auto;
  white-space: nowrap;
}

/* --- Packages Section --- */
.packages-section .section-header {
  margin-bottom: 2rem;
}

.packages-section h2 {
  font-size: 2rem;
  margin: 0 0 1.5rem 0;
}

.search-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.search-bar {
  flex: 1;
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-main);
  padding: 1rem;
  border-radius: 10px;
  font-size: 1.1rem;
  transition: border-color 0.2s;
}

.search-bar:focus {
  outline: none;
  border-color: var(--text-accent);
}

.package-count {
  color: var(--text-muted);
  font-size: 0.9rem;
  white-space: nowrap;
}

/* --- Package Grid & Cards --- */
.package-grid {
  display: grid;
  gap: 1rem;
}

.package-card {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  transition:
    transform 0.2s,
    border-color 0.2s;
}

.package-card:hover {
  transform: translateY(-2px);
  border-color: rgba(56, 189, 248, 0.4);
}

.pkg-title {
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.pkg-path {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-family: monospace;
}

.pkg-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.pkg-size {
  color: var(--text-muted);
  font-size: 0.9rem;
  font-family: monospace;
}

/* --- Status Boxes (Loading, Error, Empty) --- */
.status-box {
  text-align: center;
  padding: 4rem 2rem;
  background-color: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border);
  color: var(--text-muted);
}

.error-box {
  border-color: #ef4444;
  color: #ef4444;
}

.empty-box {
  border-style: dashed;
}

.status-box p {
  margin: 0;
}

.status-box strong {
  color: var(--text-main);
}

/* Spinner for loading state */
.spinner {
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: var(--text-accent);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* --- Footer --- */
.main-footer {
  margin-top: 6rem;
  text-align: center;
  border-top: 1px solid var(--border);
  padding-top: 2rem;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.main-footer p {
  margin: 0.3rem 0;
}

/* --- Responsive Adjustments --- */
@media (max-width: 768px) {
  .main-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .search-wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .package-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .pkg-meta {
    width: 100%;
    justify-content: space-between;
  }

  .command-box {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
