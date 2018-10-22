<template>
    <section id="app">
        <router-view class="body-content"/>

        <loading v-if="loading"/>
    </section>
</template>

<script>
// Globals functions
import { store } from './store/index.js';

// Components
import loading from './components/loading/loading.vue';

export default {
    name: 'app',
    components: {
        loading
    },
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