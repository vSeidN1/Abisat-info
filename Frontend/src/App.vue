<script setup>
import { ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import SocialLinks from './components/SocialLinks.vue'

const route = useRoute()
const menuOpen = ref(false)
const theme = ref(document.documentElement.dataset.theme || 'dark')
const year = new Date().getFullYear()
const downloadsOpen = ref(false)
const mobileDownloadsOpen = ref(false)
const links = [
  { label: 'Home', to: '/' },
  { label: 'Channels & satellites', to: '/channel-sat' },
  { label: 'Services', to: '/services' },
  { label: 'Posts', to: '/posts' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]
const primaryLinks = links.slice(0, 2)
const secondaryLinks = links.slice(2)

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

watch(theme, (value) => {
  document.documentElement.dataset.theme = value
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', value === 'dark' ? '#0d1b2a' : '#f4f7fb')
  try {
    localStorage.setItem('abisat-theme', value)
  } catch {
    // The theme still applies for this page if browser storage is unavailable.
  }
})
</script>

<template>
  <div class="site-shell">
    <header class="site-header">
      <nav class="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
        <RouterLink to="/" class="flex items-center gap-3" @click="menuOpen = false">
          <img src="/images/abisat-logo.jpg" alt="Abisat ET" class="h-11 w-11 rounded-full object-cover" />
          <span class="font-display text-lg font-bold tracking-widest text-white">ABISAT <span class="text-brand">ET</span></span>
        </RouterLink>
        <div class="flex items-center gap-2 xl:hidden">
          <button
            class="theme-toggle"
            :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
            :title="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
            @click="toggleTheme"
          >
            <svg v-if="theme === 'dark'" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" /></svg>
          </button>
          <button
            class="mobile-menu-toggle"
            :aria-label="menuOpen ? 'Close navigation menu' : 'Open navigation menu'"
            :aria-expanded="menuOpen"
            @click="menuOpen = !menuOpen"
          >
            <svg v-if="!menuOpen" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div class="hidden items-center gap-1 xl:flex">
          <RouterLink
            v-for="link in primaryLinks"
            :key="link.to"
            :to="link.to"
            class="nav-link"
            :class="{ active: route.path === link.to || (link.to === '/channel-sat' && route.path.startsWith('/channel-sat/')) }"
          >{{ link.label }}</RouterLink>
          <div class="relative" @mouseenter="downloadsOpen = true" @mouseleave="downloadsOpen = false" @focusin="downloadsOpen = true" @keydown.esc="downloadsOpen = false">
            <button
              class="nav-link inline-flex items-center gap-1"
              :class="{ active: route.path === '/software' || route.path === '/loader' }"
              :aria-expanded="downloadsOpen"
              @click="downloadsOpen = !downloadsOpen"
            >
              <svg class="h-4 w-4 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3h16v-3" /></svg>
              Downloads
              <svg class="ml-1 h-3 w-3 transition-transform" :class="{ 'rotate-180': downloadsOpen }" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m2 4 4 4 4-4" /></svg>
            </button>
            <div v-if="downloadsOpen" class="absolute right-0 top-full z-40 w-80 pt-3">
              <div class="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div class="px-3 pb-2 pt-2">
                  <p class="text-xs font-semibold uppercase tracking-[.16em] text-teal-300">Receiver library</p>
                  <p class="mt-1 text-xs text-slate-400">Software and tools for your receiver</p>
                </div>
                <RouterLink to="/software" class="download-option group" @click="downloadsOpen = false">
                  <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3" /></svg>
                  </span>
                  <span class="min-w-0 flex-1"><span class="block font-semibold text-white">Software</span><span class="mt-1 block text-xs text-slate-400">Firmware and receiver updates</span></span>
                  <span class="text-slate-500 transition group-hover:translate-x-1 group-hover:text-teal-300">→</span>
                </RouterLink>
                <RouterLink to="/loader" class="download-option group" @click="downloadsOpen = false">
                  <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6M9 11h6M9 15h2" /></svg>
                  </span>
                  <span class="min-w-0 flex-1"><span class="block font-semibold text-white">Loader</span><span class="mt-1 block text-xs text-slate-400">Recovery and installation tools</span></span>
                  <span class="text-slate-500 transition group-hover:translate-x-1 group-hover:text-teal-300">→</span>
                </RouterLink>
              </div>
            </div>
          </div>
          <RouterLink
            v-for="link in secondaryLinks"
            :key="link.to"
            :to="link.to"
            class="nav-link"
            :class="{ active: route.path === link.to }"
          >{{ link.label }}</RouterLink>
          <button
            class="theme-toggle ml-2"
            :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
            :title="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
            @click="toggleTheme"
          >
            <svg v-if="theme === 'dark'" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" /></svg>
          </button>
        </div>
      </nav>
      <div v-if="menuOpen" class="mobile-menu px-5 pb-4 xl:hidden">
        <RouterLink v-for="link in primaryLinks" :key="link.to" :to="link.to" class="mobile-link" @click="menuOpen = false">{{ link.label }}</RouterLink>
        <button class="mobile-link flex w-full items-center justify-between text-left" :aria-expanded="mobileDownloadsOpen" @click="mobileDownloadsOpen = !mobileDownloadsOpen">
          Downloads <span aria-hidden="true">{{ mobileDownloadsOpen ? '−' : '+' }}</span>
        </button>
        <div v-if="mobileDownloadsOpen" class="grid gap-1 border-l border-white/10 pl-4">
          <RouterLink to="/software" class="mobile-link" @click="menuOpen = false">Software</RouterLink>
          <RouterLink to="/loader" class="mobile-link" @click="menuOpen = false">Loader</RouterLink>
        </div>
        <RouterLink v-for="link in secondaryLinks" :key="link.to" :to="link.to" class="mobile-link" @click="menuOpen = false">{{ link.label }}</RouterLink>
      </div>
    </header>

    <main class="flex-1">
      <RouterView />
    </main>

    <footer class="border-t border-white/10 bg-midnight px-5 py-8 text-center text-slate-400">
      <SocialLinks class="mb-4" />
      <small>© {{ year }} Abisat ET. All rights reserved.</small>
    </footer>
  </div>
</template>
