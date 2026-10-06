import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './assets/main.css'
import HomeView from './views/HomeView.vue'
import DownloadsView from './views/DownloadsView.vue'
import ChannelsView from './views/ChannelsView.vue'
import SatelliteView from './views/SatelliteView.vue'
import PostsView from './views/PostsView.vue'
import StaticView from './views/StaticView.vue'
import AdminPostsView from './views/AdminPostsView.vue'
import AdminUploadView from './views/AdminUploadView.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', component: HomeView },
    { path: '/software', component: DownloadsView, props: { type: 'software' } },
    { path: '/loader', component: DownloadsView, props: { type: 'loader' } },
    { path: '/channel-sat', component: ChannelsView },
    { path: '/channel-sat/:name', component: SatelliteView },
    { path: '/posts', component: PostsView },
    { path: '/about', component: StaticView, props: { page: 'about' } },
    { path: '/services', component: StaticView, props: { page: 'services' } },
    { path: '/contact', component: StaticView, props: { page: 'contact' } },
    { path: '/admin', component: AdminPostsView },
    { path: '/admin/edit/:id', component: AdminPostsView },
    { path: '/admin/upload', component: AdminUploadView },
    { path: '/admin/posts', redirect: '/admin' },
    { path: '/admin/posts/edit/:id', redirect: (to) => `/admin/edit/${to.params.id}` },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

createApp(App).use(router).mount('#app')
