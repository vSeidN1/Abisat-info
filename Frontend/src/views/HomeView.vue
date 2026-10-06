<script setup>
import { RouterLink } from 'vue-router'

const brands = [
  { name: 'LifeStar', image: '/images/LIFESTAR.png' },
  { name: 'GoldStar', image: '/images/GOLDSTAR-RECEIVERS.png' },
  { name: 'SuperStar', image: '/images/SUPERSTAR.png' },
  { name: 'RealStar', image: '/images/REALSTAR.png' },
  { name: 'LEG', image: '/images/LEG.png' },
  { name: 'StarSat', image: '/images/starsat.webp' },
]
</script>

<template>
  <section class="relative flex min-h-[30rem] items-center justify-center overflow-hidden border-b border-white/10">
    <div class="mx-auto w-full max-w-7xl px-5 py-20 text-center md:py-28 lg:px-8">
      <div class="mx-auto flex max-w-4xl flex-col items-center">
        <p class="eyebrow">Your satellite companion</p>
        <h1 class="page-title max-w-3xl !mt-4 !text-5xl md:!text-7xl">Stay connected.<br /><span class="text-brand">Stay updated.</span></h1>
        <p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">Your trusted source for satellite channels, receiver software, loaders, and the latest dish updates.</p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <RouterLink to="/software" class="btn-primary">Browse downloads <span class="ml-2">→</span></RouterLink>
          <RouterLink to="/channel-sat" class="btn-secondary">Explore channels</RouterLink>
        </div>
        <a class="mt-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-brand" href="https://t.me/AbisatAfrica" target="_blank" rel="noreferrer">
          <svg class="h-5 w-5 text-sky-400" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.8 4.2 18.6 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L6 13.5 1.1 12c-1.1-.3-1.1-1 .2-1.5L20.4 3c.9-.3 1.7.2 1.4 1.2Z" /></svg>
          Join us on Telegram
        </a>
      </div>
    </div>
  </section>

  <section class="mx-auto max-w-7xl px-5 py-16 lg:px-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div><p class="eyebrow">Receiver brands</p><h2 class="mt-2 font-display text-3xl font-bold text-white">Find your receiver</h2></div>
      <p class="max-w-md text-sm leading-6 text-slate-400">Browse available software and loader files by receiver brand.</p>
    </div>
    <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <article v-for="brand in brands" :key="brand.name" class="panel overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-brand/50">
        <div class="flex h-40 items-center justify-center bg-white p-5"><img :src="brand.image" :alt="`${brand.name} receiver`" class="h-full w-full object-contain" /></div>
        <div class="p-5">
          <h3 class="font-display text-xl font-bold text-brand">{{ brand.name }}</h3>
          <p class="mt-2 text-sm text-slate-400">Software and loader downloads for {{ brand.name }} receivers.</p>
          <div class="mt-5 flex gap-2">
            <RouterLink :to="{ path: '/software', query: { brand: brand.name } }" class="btn-secondary !px-4 !py-2 text-sm">Software</RouterLink>
            <RouterLink :to="{ path: '/loader', query: { brand: brand.name } }" class="btn-primary !px-4 !py-2 text-sm">Loader</RouterLink>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
