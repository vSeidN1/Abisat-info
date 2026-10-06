<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { api, toFormData } from '../api'

const route = useRoute()
const router = useRouter()
const posts = ref([])
const login = reactive({ username: '', password: '' })
const form = reactive({ title: '', content: '', image: null })
const credentials = ref(sessionStorage.getItem('adminCredentials') || '')
const error = ref('')
const success = ref('')
const loading = ref(false)
const editId = computed(() => route.params.id)

async function loadPosts() {
  loading.value = true
  error.value = ''
  try {
    posts.value = await api('/api/admin/posts')
    if (editId.value) {
      const post = await api(`/api/admin/posts/${editId.value}`)
      Object.assign(form, { title: post.title, content: post.content, image: null })
    }
  } catch (err) {
    error.value = err.message
    if (err.message.includes('Unauthorized')) sessionStorage.removeItem('adminCredentials')
  } finally {
    loading.value = false
  }
}

async function signIn() {
  error.value = ''
  credentials.value = btoa(`${login.username}:${login.password}`)
  sessionStorage.setItem('adminCredentials', credentials.value)
  await loadPosts()
}

function signOut() {
  sessionStorage.removeItem('adminCredentials')
  credentials.value = ''
  Object.assign(login, { username: '', password: '' })
}

async function savePost() {
  error.value = ''
  success.value = ''
  try {
    const editing = Boolean(editId.value)
    await api(editing ? `/api/admin/posts/${editId.value}` : '/api/admin/posts', {
      method: editing ? 'PUT' : 'POST',
      body: toFormData(form, ['image']),
    })
    success.value = editing ? 'Post updated.' : 'Post published.'
    Object.assign(form, { title: '', content: '', image: null })
    await loadPosts()
    if (editing) router.push('/admin')
  } catch (err) {
    error.value = err.message
  }
}

async function deletePost(id) {
  if (!window.confirm('Delete this post? This cannot be undone.')) return
  error.value = ''
  try {
    await api(`/api/admin/posts/${id}`, { method: 'DELETE' })
    posts.value = posts.value.filter((post) => post.id !== id)
  } catch (err) {
    error.value = err.message
  }
}

function setImage(event) {
  form.image = event.target.files?.[0] || null
}

onMounted(() => { if (credentials.value) loadPosts() })
</script>

<template>
  <section class="page-wrap">
    <p class="eyebrow">Content management</p><h1 class="page-title">Admin post panel</h1>
    <div v-if="!credentials" class="panel mx-auto mt-8 max-w-xl p-7">
      <h2 class="font-display text-xl font-bold text-white">Admin sign in</h2>
      <form class="mt-5 space-y-4" @submit.prevent="signIn">
        <label class="block text-sm">Username<input v-model="login.username" class="field mt-2" autocomplete="username" required /></label>
        <label class="block text-sm">Password<input v-model="login.password" class="field mt-2" type="password" autocomplete="current-password" required /></label>
        <div v-if="error" class="status-error">{{ error }}</div>
        <button class="btn-primary w-full" :disabled="loading">Sign in</button>
      </form>
    </div>
    <template v-else>
      <div class="mt-6 flex flex-wrap gap-3"><RouterLink to="/admin/upload" class="btn-secondary">Upload receiver file</RouterLink><button class="btn-secondary" @click="signOut">Sign out</button></div>
      <div v-if="error" class="status-error mt-6">{{ error }}</div>
      <div v-if="success" class="status-success mt-6">{{ success }}</div>
      <form class="panel mt-7 space-y-5 p-6 md:p-8" @submit.prevent="savePost">
        <h2 class="font-display text-xl font-bold text-white">{{ editId ? 'Edit post' : 'Publish a post' }}</h2>
        <label class="block text-sm">Title<input v-model="form.title" class="field mt-2" required maxlength="250" /></label>
        <label class="block text-sm">Content<textarea v-model="form.content" class="field mt-2" rows="6" required maxlength="20000"></textarea></label>
        <label class="block text-sm">Image (optional)<input class="field mt-2" type="file" accept="image/*" @change="setImage" /></label>
        <button class="btn-primary" :disabled="loading">{{ editId ? 'Save changes' : 'Publish post' }}</button>
        <RouterLink v-if="editId" to="/admin" class="btn-secondary ml-2">Cancel</RouterLink>
      </form>
      <h2 class="mt-10 font-display text-2xl font-bold text-white">Recent posts</h2>
      <div v-if="loading" class="mt-4 text-slate-400">Loading posts…</div>
      <div v-else-if="!posts.length" class="panel mt-4 p-6 text-slate-400">No posts yet.</div>
      <div v-else class="mt-4 grid gap-4 md:grid-cols-2">
        <article v-for="post in posts" :key="post.id" class="panel p-5">
          <h3 class="font-semibold text-white">{{ post.title }}</h3><p class="mt-2 line-clamp-3 text-sm text-slate-400">{{ post.content }}</p>
          <div class="mt-4 flex gap-3"><RouterLink :to="`/admin/edit/${post.id}`" class="btn-secondary !px-4 !py-2 text-sm">Edit</RouterLink><button class="btn-secondary !border-red-400/40 !px-4 !py-2 text-sm !text-red-300" @click="deletePost(post.id)">Delete</button></div>
        </article>
      </div>
    </template>
  </section>
</template>
