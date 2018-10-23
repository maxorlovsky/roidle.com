<template>
    <section id="app">
        <router-view :class="{'docked-menu-open': dockedMenu}"
            class="body-content"
        />

        <docked-menu v-if="dockedMenu" />

        <loading v-if="loading" />
    </section>
</template>

<script>
// Globals functions
import { functions } from './functions.js';
import { store } from './store/index.js';

// Components
import dockedMenu from './components/docked-menu/docked-menu.vue';
import loading from './components/loading/loading.vue';

export default {
    name: 'app',
    components: {
        dockedMenu,
        loading
    },
    store: store,
    data() {
        return {
            loading: true
        };
    },
    computed: {
        dockedMenu() {
            return this.$store.getters.get('dockedMenu');
        }
    },
    mounted() {
        if (functions.storage('get', 'party')) {
            // Storing the party in vuex and displaying docked menu
            this.$store.commit('saveParty', functions.storage('get', 'party'));
            this.$store.commit('displayDockedMenu', true);

            // Redirecting to main game page
            // 1this.$router.replace('/game');
        } else {
            // If party is not there, placing to home page
            this.$router.replace('/');
        }

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