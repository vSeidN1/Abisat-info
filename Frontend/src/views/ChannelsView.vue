<script setup>
import { RouterLink } from 'vue-router'

const satellites = [
  { path: 'nilesat', name: 'Nilesat 7°W' },
  { path: 'eutealsat7', name: 'Eutelsat 7°E' },
  { path: 'badr4', name: 'Badr 26°E' },
  { path: 'eutealsat36', name: 'Eutelsat 36°E' },
  { path: 'packsat', name: 'C_Packsat 38°E' },
  { path: 'belintersat', name: 'Belintersat 51.5°E' },
  { path: 'yahsat', name: 'Yahsat 52.5°E' },
  { path: 'nss-12', name: 'NSS 57°E' },
  { path: 'intealsat', name: 'Intelsat 62°E' },
]
</script>

<template>
  <section class="page-wrap">
    <p class="eyebrow">Channel guide</p>
    <h1 class="page-title">Channels & satellites</h1>
    <p class="mt-3 max-w-2xl text-slate-400">Choose a satellite to open its dedicated channel guide and see the latest availability information.</p>
    <div class="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink v-for="satellite in satellites" :key="satellite.path" :to="`/channel-sat/${satellite.path}`" class="panel flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:border-brand/50">
        <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-2xl">📡</span>
        <span class="min-w-0 flex-1">
          <span class="block font-semibold text-white">{{ satellite.name }}</span>
        </span>
      </RouterLink>
    </div>
    <div class="mt-8 text-center">
      <a href="https://t.me/AbisatAfrica" class="btn-secondary gap-2" target="_blank" rel="noreferrer">
        <svg class="h-5 w-5 text-sky-400" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.8 4.2 18.6 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L6 13.5 1.1 12c-1.1-.3-1.1-1 .2-1.5L20.4 3c.9-.3 1.7.2 1.4 1.2Z" /></svg>
        More satellite updates
      </a>
    </div>
  </section>
</template>
