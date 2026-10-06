<script setup>
const props = defineProps({
  platforms: {
    type: Array,
    default: () => ['telegram', 'youtube', 'facebook', 'email', 'phone'],
  },
})

const links = {
  telegram: { label: 'Telegram', href: 'https://t.me/AbisatAfrica', color: 'text-sky-400' },
  youtube: { label: 'YouTube', href: 'https://youtube.com/@AbisatEthiopia', color: 'text-red-500' },
  facebook: { label: 'Facebook', href: 'https://facebook.com/Abisatinfo1', color: 'text-blue-500' },
  email: { label: 'Email', href: 'mailto:abisatinfo.support@gmail.com', color: 'text-rose-400' },
  phone: { label: 'Phone', href: 'tel:+251911837202', color: 'text-green-400' },
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-5">
    <a
      v-for="platform in props.platforms"
      :key="platform"
      :href="links[platform].href"
      :aria-label="links[platform].label"
      :title="links[platform].label"
      :target="['telegram', 'youtube', 'facebook'].includes(platform) ? '_blank' : undefined"
      :rel="['telegram', 'youtube', 'facebook'].includes(platform) ? 'noreferrer' : undefined"
      class="social-link"
      :class="links[platform].color"
    >
      <svg v-if="platform === 'telegram'" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M21.8 4.2 18.6 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L6 13.5 1.1 12c-1.1-.3-1.1-1 .2-1.5L20.4 3c.9-.3 1.7.2 1.4 1.2Z" />
      </svg>
      <svg v-else-if="platform === 'youtube'" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
      </svg>
      <svg v-else-if="platform === 'facebook'" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.3c0-3 1.8-4.6 4.5-4.6 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.5 0-2 .9-2 1.9V12H17l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12Z" />
      </svg>
      <svg v-else-if="platform === 'email'" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M2.5 4h19A2.5 2.5 0 0 1 24 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-19A2.5 2.5 0 0 1 0 17.5v-11A2.5 2.5 0 0 1 2.5 4Zm9.5 8.1L2 6.4v.2l10 6.5 10-6.5v-.2l-9.5 5.7a.9.9 0 0 1-1 0Z" />
      </svg>
      <svg v-else-if="platform === 'phone'" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M6.6 10.8a15.6 15.6 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.2 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1A18 18 0 0 1 2.7 3.5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .6 3.6 1 1 0 0 1-.2 1l-2 2.7Z" />
      </svg>
    </a>
  </div>
</template>
