<div style="display: flex; align-items: center; background: rgba(56, 189, 248, 0.05); padding: 15px; border-radius: 10px; border: 1px solid rgba(56, 189, 248, 0.2); margin-top: 20px;">
  <div style="width: 50px; height: 50px; margin-right: 15px; filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.6));">
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4L3 18H21L12 4Z" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M9 14L12 9L15 14" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </div>
  <div>
    <strong style="font-size: 1.2rem; color: #38bdf8; display: block;">MatiM72737 Alpine Repository</strong>
    <span style="font-style: italic; font-size: 0.9rem; opacity: 0.8;">Custom Alpine Linux Package Repository</span>
  </div>
</div>

[![GitHub Pages](https://img.shields.io/badge/Web-Interface-blue?style=flat-square)](https://matim72737.github.io/matims-arepo/)
[![Alpine Linux](https://img.shields.io/badge/Alpine-Linux-0d597f?style=flat-square&logo=alpine-linux&logoColor=white)](https://alpinelinux.org/)

A professional-grade, personal Alpine Linux package repository (APK) hosted on **Hugging Face Datasets** and served via a custom **Vue 3** dashboard.

## 🚀 Quick Start

To integrate this repository into your Alpine Linux environment, execute the following:

```bash
# Add the repository to your apk repositories list
echo "https://huggingface.co/datasets/MatiM72737/matims-arepo/resolve/main/community" >> /etc/apk/repositories

# Update your local package index
apk update
```
