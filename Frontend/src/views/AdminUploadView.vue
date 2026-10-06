<script setup>
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { api, toFormData } from '../api'

const form = reactive({ brand: '', model: '', type: 'software', description: '', file: null })
const login = reactive({ username: '', password: '' })
const credentials = ref(sessionStorage.getItem('adminCredentials') || '')
const error = ref('')
const success = ref('')
const saving = ref(false)

function setFile(event) {
  form.file = event.target.files?.[0] || null
}

function signOut() {
  sessionStorage.removeItem('adminCredentials')
  credentials.value = ''
  Object.assign(login, { username: '', password: '' })
  error.value = ''
  success.value = ''
}

async function signIn() {
  error.value = ''
  credentials.value = btoa(`${login.username}:${login.password}`)
  sessionStorage.setItem('adminCredentials', credentials.value)
  try {
    await api('/api/admin/posts')
    success.value = 'Signed in successfully.'
  } catch (err) {
    error.value = err.message
    signOut()
  }
}

async function uploadFile() {
  error.value = ''
  success.value = ''
  saving.value = true
  try {
    await api('/api/admin/downloads', { method: 'POST', body: toFormData(form, ['file']) })
    success.value = 'File uploaded successfully.'
    Object.assign(form, { brand: '', model: '', type: 'software', description: '', file: null })
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="page-wrap">
    <p class="eyebrow">Content management</p><h1 class="page-title">Upload receiver file</h1>
    <RouterLink to="/admin" class="mt-4 inline-block text-sm text-brand hover:text-white">← Back to post panel</RouterLink>

    <div v-if="!credentials" class="panel mx-auto mt-8 max-w-xl p-7">
      <h2 class="font-display text-xl font-bold text-white">Admin sign in</h2>
      <form class="mt-5 space-y-4" @submit.prevent="signIn">
        <label class="block text-sm">Username<input v-model="login.username" class="field mt-2" autocomplete="username" required /></label>
        <label class="block text-sm">Password<input v-model="login.password" class="field mt-2" type="password" autocomplete="current-password" required /></label>
        <div v-if="error" class="status-error">{{ error }}</div>
        <button class="btn-primary w-full">Sign in</button>
      </form>
    </div>

    <div v-else class="mx-auto mt-7 max-w-3xl">
      <div class="mb-5 flex justify-end">
        <button class="btn-secondary" @click="signOut">Sign out</button>
      </div>
      <div v-if="error" class="status-error mb-5">{{ error }}</div>
      <div v-if="success" class="status-success mb-5">{{ success }}</div>
      <form class="panel grid gap-5 p-6 md:grid-cols-2 md:p-8" @submit.prevent="uploadFile">
        <label class="block text-sm">Brand<input v-model="form.brand" class="field mt-2" placeholder="e.g. LifeStar" required maxlength="100" /></label>
        <label class="block text-sm">Model<input v-model="form.model" class="field mt-2" placeholder="e.g. LS-1000" required maxlength="100" /></label>
        <label class="block text-sm">File type<select v-model="form.type" class="field mt-2"><option value="software">Software</option><option value="loader">Loader</option></select></label>
        <label class="block text-sm">File<input class="field mt-2" type="file" required @change="setFile" /></label>
        <label class="block text-sm md:col-span-2">Description<input v-model="form.description" class="field mt-2" placeholder="Short description" maxlength="1000" /></label>
        <button class="btn-primary md:col-span-2" :disabled="saving">{{ saving ? 'Uploading…' : 'Upload file' }}</button>
      </form>
    </div>
  </section>
</template>
