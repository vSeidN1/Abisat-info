<script setup>
import { reactive, ref } from 'vue'
import { api } from '../api'
import SocialLinks from '../components/SocialLinks.vue'

defineProps({ page: { type: String, required: true } })

const form = reactive({ name: '', email: '', message: '' })
const sending = ref(false)
const error = ref('')
const success = ref('')

async function sendMessage() {
  sending.value = true
  error.value = ''
  success.value = ''
  try {
    const result = await api('/api/contact', { method: 'POST', body: JSON.stringify(form) })
    success.value = result.message
    Object.assign(form, { name: '', email: '', message: '' })
  } catch (err) {
    error.value = err.message
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <section v-if="page === 'about'" class="page-wrap">
    <div class="mx-auto max-w-4xl text-center">
      <img src="/images/abisat-logo.jpg" alt="Abisat ET" class="mx-auto h-28 w-28 rounded-full object-cover shadow-xl" />
      <p class="eyebrow mt-7">Who we are</p><h1 class="page-title">About Abisat ET</h1>
      <p class="mt-4 text-lg text-slate-300">Your trusted source for satellite channels, software, and more.</p>
      <div class="panel mt-9 space-y-5 p-7 text-left leading-7 text-slate-300 md:p-9">
        <p>Abisat ET is built by satellite and tech enthusiasts who believe that access to entertainment and information should be simple, smart, and up to date. We cover the latest satellite channel updates, receiver software, loaders, and tools trusted by users across the country.</p>
        <p>We deliver updates — from satellite frequencies to software releases — from verified sources and tested solutions.</p>
        <p>Our goal is to empower users with the knowledge and tools they need to unlock the full potential of their satellite receivers.</p>
        <div class="flex flex-wrap items-center gap-4">
          <span>Join us for dish information and technology updates.</span>
          <SocialLinks :platforms="['telegram', 'youtube']" />
        </div>
      </div>
    </div>
  </section>

  <section v-else-if="page === 'services'" class="page-wrap">
    <p class="eyebrow">Server | IPTV | Coin</p><h1 class="page-title">Our services</h1>
    <p class="mt-3 max-w-2xl text-slate-400">Choose a service below to contact us on Telegram for details and availability.</p>
    <div class="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <a v-for="item in [
        { title: 'FOREVER SERVER', offerings: ['Forever Server for 3 Month', 'Forever Server for 6 Month', 'Forever Server for 1 Year'] },
        { title: 'FUNCAM SERVER', offerings: ['Funcam Server for 3 Month', 'Funcam Server for 6 Month', 'Funcam Server for 1 Year'] },
        { title: '24H SPORTS SERVER', offerings: ['24H Sports Server for 3 Month', '24H Sports Server for 6 Month', '24H Sports Server for 1 Year'] },
        { title: 'GSEEK SERVER for Normal receivers', offerings: ['SPTV Server for 1 Month', 'SPTV Server for 3 Month', 'SPTV Server for 6 Month', 'SPTV Server for 1 Year'] },
        { title: 'GSEEK SERVER for Changed receivers', offerings: ['SPTV Server for 1 Month', 'SPTV Server for 3 Month', 'SPTV Server for 6 Month', 'SPTV Server for 1 Year'] },
        { title: 'VIP 1 SERVER', offerings: ['VIP 1 for 1 Month', 'VIP 1 for 3 Month', 'VIP 1 for 6 Month', 'VIP 1 for 1 Year'] },
        { title: 'VIP 2 SERVER', offerings: ['VIP 2 for 1 Month', 'VIP 2 for 3 Month', 'VIP 2 for 6 Month', 'VIP 2 for 1 Year'] },
        { title: 'Moreplex & B-GLSTV SERVER', offerings: ['Moreplex & B-GLSTV for 1 Month', 'Moreplex & B-GLSTV 3 Month', 'Moreplex & B-GLSTV 6 Month', 'Moreplex & B-GLSTV for 12 Month'] },
        { title: 'IPTV', offerings: ['Apollo IPTV', 'ETV PRO IPTV', 'ETV PLUS IPTV', 'MY HD IPTV'] },
        { title: 'COIN & Other Services', offerings: ['Mango Account Creating', 'Mango Coin Selling', 'Buying & Selling Other Coins', 'Selling Different Electronics devices'] },
      ]" :key="item.title" href="https://t.me/AbisatAd" target="_blank" rel="noreferrer" class="panel block p-5 transition hover:-translate-y-1 hover:border-brand/50">
        <h2 class="flex items-center gap-2 font-display font-bold text-white">
          <svg class="h-5 w-5 shrink-0 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="7" width="18" height="12" rx="2" /><path d="M7 7V5h10v2M7 11h10M7 15h6" /></svg>
          {{ item.title }}
        </h2>
        <ul class="mt-4 list-inside list-disc space-y-2 text-sm text-slate-300">
          <li v-for="offering in item.offerings" :key="offering">{{ offering }}</li>
        </ul>
      </a>
    </div>
    <div class="mt-8 text-center">
      <a href="https://t.me/AbisatAd" class="btn-secondary gap-2" target="_blank" rel="noreferrer">
        <svg class="h-5 w-5 text-sky-400" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.8 4.2 18.6 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L6 13.5 1.1 12c-1.1-.3-1.1-1 .2-1.5L20.4 3c.9-.3 1.7.2 1.4 1.2Z" /></svg>
        Get our services
      </a>
    </div>
  </section>

  <section v-else class="page-wrap">
    <div class="mx-auto max-w-2xl">
      <p class="eyebrow">Get in touch</p><h1 class="page-title">Contact us</h1>
      <p class="mt-3 text-slate-400">We'd love to hear from you. Send us a message and we’ll get back to you.</p>
      <div v-if="success" class="status-success mt-6">{{ success }}</div>
      <div v-if="error" class="status-error mt-6">{{ error }}</div>
      <form class="panel mt-7 space-y-5 p-6 md:p-8" @submit.prevent="sendMessage">
        <label class="block text-sm font-medium text-slate-200">Your name<input v-model="form.name" class="field mt-2" autocomplete="name" required maxlength="120" /></label>
        <label class="block text-sm font-medium text-slate-200">Email address<input v-model="form.email" class="field mt-2" type="email" autocomplete="email" required maxlength="254" /></label>
        <label class="block text-sm font-medium text-slate-200">Message<textarea v-model="form.message" class="field mt-2" rows="5" required maxlength="5000"></textarea></label>
        <button class="btn-primary w-full" :disabled="sending">{{ sending ? 'Sending…' : 'Send message' }}</button>
      </form>
      <div class="mt-6"><SocialLinks /></div>
    </div>
  </section>
</template>
