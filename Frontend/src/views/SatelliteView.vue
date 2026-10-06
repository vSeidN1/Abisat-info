<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api'

const route = useRoute()
const channels = ref([])
const loading = ref(true)
const error = ref('')
const satellite = computed(() => String(route.params.name).replace(/-/g, ' '))

async function loadChannels() {
  loading.value = true
  error.value = ''
  try {
    const result = await api(`/api/satellites/${encodeURIComponent(String(route.params.name))}/channels`)
    channels.value = result.channels
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(loadChannels)
watch(() => route.params.name, loadChannels)
</script>

<template>
  <section class="page-wrap">
    <p class="eyebrow">Satellite channel guide</p>
    <h1 class="page-title capitalize">{{ satellite }} channels</h1>
    <div v-if="error" class="status-error mt-8">{{ error }}</div>
    <div v-else-if="loading" class="mt-8 text-slate-400">Loading channels…</div>
    <template v-else>
    <div class="panel relative mt-8 overflow-hidden p-8 text-center md:p-10">
      <div class="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-teal-400/10 blur-3xl"></div>
      <div class="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-300/20 bg-teal-300/10 text-3xl">📡</div>
      <span class="relative mt-5 inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-200">
        <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-300"></span>
        Coming soon
      </span>
      <h2 class="relative mt-4 font-display text-2xl font-bold text-white">{{ channels.length ? `More ${satellite} updates are coming` : `We’re tuning in to ${satellite}` }}</h2>
      <p class="relative mx-auto mt-3 max-w-xl leading-7 text-slate-400">
        {{ channels.length ? `We’re preparing more verified frequencies and channel details for ${satellite}. Available channel information is shown below.` : `The channel guide for ${satellite} is being prepared. Frequency details and channel updates will appear here once they’re ready. Please check back soon.` }}
      </p>
      <a class="btn-secondary relative mt-6 gap-2" href="https://t.me/AbisatAfrica" target="_blank" rel="noreferrer">
        <svg class="h-5 w-5 text-sky-400" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.8 4.2 18.6 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L6 13.5 1.1 12c-1.1-.3-1.1-1 .2-1.5L20.4 3c.9-.3 1.7.2 1.4 1.2Z" /></svg>
        Follow satellite updates
      </a>
    </div>
    <div v-if="channels.length" class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <article v-for="channel in channels" :key="channel.id" class="panel p-6">
        <h2 class="font-display text-xl font-bold text-teal-300">📺 {{ channel.channel_name }}</h2>
        <p class="mt-4 text-sm text-slate-300"><strong class="text-white">Frequency:</strong> {{ channel.frequency || '—' }}</p>
        <p v-if="channel.biss_key" class="mt-3 text-sm text-slate-300"><strong class="text-white">BISS key:</strong> <code class="rounded bg-amber-100 px-2 py-1 font-bold text-slate-900">{{ channel.biss_key }}</code></p>
      </article>
    </div>
    </template>
  </section>
</template>
