// Vue
import Vue from 'vue';
import VueRouter from 'vue-router';
import { store } from './store/index.js';

Vue.use(VueRouter);

// Add <any> URLs to router, to push to /login
mo.routes.push({
    path: '*',
    redirect: '/'
});

// Initiate the router
const router = new VueRouter({
    mode: 'history',
    routes: mo.routes
});

router.beforeEach((to, from, next) => {
    window.scrollTo(0, 0);

    // To hide item info in case user redirect from one page to the other and it's open
    store.commit('closeItemInfo');

    next();
});

export default router;