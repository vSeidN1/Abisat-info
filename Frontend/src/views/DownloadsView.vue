<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api'

const props = defineProps({ type: { type: String, required: true } })
const route = useRoute()
const files = ref([])
const loading = ref(true)
const error = ref('')

async function loadFiles() {
  loading.value = true
  error.value = ''
  try {
    const query = new URLSearchParams({ type: props.type })
    if (route.query.brand) query.set('brand', String(route.query.brand))
    files.value = await api(`/api/downloads?${query}`)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(loadFiles)
watch(() => [props.type, route.query.brand], loadFiles)
</script>

<template>
  <section class="page-wrap">
    <p class="eyebrow">Receiver downloads</p>
    <h1 class="page-title">{{ type === 'software' ? 'Software downloads' : 'Loader downloads' }}</h1>
    <p class="mt-3 text-slate-400">{{ route.query.brand ? `Files for ${route.query.brand}` : 'Browse available files for your receiver.' }}</p>
    <div v-if="error" class="status-error mt-8">{{ error }}</div>
    <div v-else-if="loading" class="mt-8 text-slate-400">Loading downloads…</div>
    <div v-else-if="!files.length" class="panel mt-8 p-8 text-center text-slate-300">No {{ type }} files are available{{ route.query.brand ? ` for ${route.query.brand}` : '' }} yet.</div>
    <div v-else class="table-wrap mt-8">
      <table class="data-table">
        <thead><tr><th>Brand</th><th>Model</th><th>File</th><th v-if="type === 'software'">Description</th><th>Action</th></tr></thead>
        <tbody>
          <tr v-for="file in files" :key="file.id">
            <td>{{ file.brand }}</td><td class="font-semibold">{{ file.model }}</td><td>{{ file.filename }}</td>
            <td v-if="type === 'software'">{{ file.description }}</td>
            <td><a :href="`/api/downloads/${file.id}/file`" class="btn-secondary !px-4 !py-2 text-sm">↓ Download</a></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-8 text-center">
      <a href="https://t.me/Abisatinfobot" class="btn-secondary gap-2" target="_blank" rel="noreferrer">
        <svg class="h-5 w-5 text-sky-400" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.8 4.2 18.6 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L6 13.5 1.1 12c-1.1-.3-1.1-1 .2-1.5L20.4 3c.9-.3 1.7.2 1.4 1.2Z" /></svg>
        Ask us for more
      </a>
    </div>
  </section>
</template>
