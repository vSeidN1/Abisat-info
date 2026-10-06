<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api'

const route = useRoute()
const router = useRouter()
const result = ref({ posts: [], page: 1, totalPages: 0 })
const loading = ref(true)
const error = ref('')

async function loadPosts() {
  loading.value = true
  error.value = ''
  try {
    const page = Math.max(1, Number.parseInt(String(route.query.page || '1'), 10) || 1)
    result.value = await api(`/api/posts?page=${page}`)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function goToPage(page) {
  router.push({ path: '/posts', query: { page } })
}

onMounted(loadPosts)
watch(() => route.query.page, loadPosts)
</script>

<template>
  <section class="page-wrap">
    <p class="eyebrow">News and updates</p>
    <h1 class="page-title">Latest posts</h1>
    <div v-if="error" class="status-error mt-8">{{ error }}</div>
    <div v-else-if="loading" class="mt-8 text-slate-400">Loading posts…</div>
    <div v-else-if="!result.posts.length" class="panel mt-8 p-8 text-center text-slate-300">There are no posts yet. Check back for satellite news and channel updates.</div>
    <div v-else class="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <article v-for="post in result.posts" :key="post.id" class="panel overflow-hidden">
        <img v-if="post.image" :src="`/uploads/${encodeURIComponent(post.image)}`" :alt="post.title" class="h-52 w-full object-cover" />
        <div class="p-6">
          <h2 class="font-display text-xl font-bold text-white">{{ post.title }}</h2>
          <p class="mt-3 whitespace-pre-line text-sm leading-6 text-slate-300">{{ post.content }}</p>
          <time class="mt-5 block text-xs text-slate-500">{{ new Date(post.created_at).toLocaleDateString() }}</time>
        </div>
      </article>
    </div>
    <div v-if="result.totalPages > 1" class="mt-8 flex justify-center gap-3">
      <button class="btn-secondary" :disabled="result.page <= 1" @click="goToPage(result.page - 1)">Previous</button>
      <span class="self-center text-sm text-slate-400">Page {{ result.page }} of {{ result.totalPages }}</span>
      <button class="btn-secondary" :disabled="result.page >= result.totalPages" @click="goToPage(result.page + 1)">Next</button>
    </div>
  </section>
</template>
