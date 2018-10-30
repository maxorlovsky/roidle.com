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

    // Check if user is logged in and if page require user to be logged in
    if (to.meta.loggedIn && !mo.loggedIn) {
        console.error('Authentication failure');
        next('/');

        return false;
    }

    // Set up meta title
    document.title = 'mo';
    if (to.meta.title) {
        document.title = `${to.meta.title} | ${document.title}`;
    }

    next();
});

export default router;