<template>
    <section id="app">
        <router-view class="body-content"/>

        <section v-if="loading"
            class="pre-loading"
        >
            <img src="/dist/assets/images/logo.png"
                alt="Loading"
            >
        </section>
    </section>
</template>

<script>
// Globals functions
import { store } from './store/index.js';

// Components
// 1import loading from './components/loading/loading.vue';

export default {
    name: 'app',
    store: store,
    data() {
        return {
            loading: true
        };
    },
    mounted() {
        this.removeLoader();
    },
    methods: {
        removeLoader() {
            // Remove loader
            this.loading = false;
        }
    }
};
</script>