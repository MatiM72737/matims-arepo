<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

interface Package {
  path: string;
  sha: string;
  size: number;
}

const allPackages = ref<Package[]>([]);
const searchQuery = ref("");
const loading = ref(true);
const error = ref<string | null>(null);

const REPO_NAME = "MatiM72737/matims-arepo";
const API_URL = `https://huggingface.co/api/datasets/${REPO_NAME}/tree/main?recursive=true`;
const RAW_URL_BASE = `https://huggingface.co/datasets/${REPO_NAME}/resolve/main`;

const fetchData = async () => {
  try {
    loading.value = true;
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
    const data = await response.json();
    allPackages.value = data.filter((f: any) => f.path.endsWith(".apk"));
  } catch (e) {
    error.value = "Failed to load packages.";
  } finally {
    loading.value = false;
  }
};

const filteredPackages = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  return q
    ? allPackages.value.filter((p) => p.path.toLowerCase().includes(q))
    : allPackages.value;
});

const getFileName = (path: string) => path.split("/").pop() || path;
const formatSize = (b: number) => {
  if (!b) return "0 B";
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return `${(b / Math.pow(1024, i)).toFixed(2)} ${["B", "KB", "MB", "GB"][i]}`;
};

const copyToClipboard = () => {
  const fullUrl = `${RAW_URL_BASE}/edge/community`; // Kopiujemy pełną ścieżkę
  navigator.clipboard.writeText(fullUrl);
  alert("Repository URL copied!");
};

onMounted(fetchData);
</script>

<template>
  <div class="app-wrapper">
    <div class="container">
      <header class="main-header">
        <div class="logo-area">
          <div class="logo-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4L3 18H21L12 4Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M9 14L12 9L15 14"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="title-group">
            <h1>MatiM Arepo</h1>
            <p class="subtitle">Custom Alpine Linux Package Repository</p>
          </div>
        </div>
        <nav class="header-links">
          <a
            :href="`https://huggingface.co/datasets/${REPO_NAME}`"
            target="_blank"
            >Dataset Info</a
          >
          <a
            href="https://github.com/matim72737/matims-arepo-webpage"
            target="_blank"
            >GitHub</a
          >
        </nav>
      </header>

      <main>
        <section class="setup-section card">
          <div class="card-header">
            <h3>🚀 Quick System Setup</h3>
            <p>Add this repository to your Alpine Linux installation:</p>
          </div>
          <div class="command-box">
            <code
              >echo "{{ RAW_URL_BASE }}/edge/community" | sudo tee -a
              /etc/apk/repositories</code
            >
            <button @click="copyToClipboard" class="btn-secondary">
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
                placeholder="Search packages..."
                class="search-bar"
              />
              <span class="package-count"
                >{{ filteredPackages.length }} APKs found</span
              >
            </div>
          </div>

          <div v-if="loading" class="status-box">
            <div class="spinner"></div>
            <p>Loading index...</p>
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
                  class="btn-primary"
                  target="_blank"
                  >Download</a
                >
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer class="main-footer">
        <p>Maintained with precision by MatiM.</p>
      </footer>
    </div>
  </div>
</template>
