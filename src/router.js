// Vue
import Vue from 'vue';
import VueRouter from 'vue-router';

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

    next();
});

export default router;