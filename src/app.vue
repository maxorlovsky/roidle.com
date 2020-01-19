<template>
    <section id="app"
        class="app"
    >
        <char-info-top v-if="dockedMenu" />

        <router-view :class="{'docked-menu-open': dockedMenu}"
            class="body-content"
        />

        <chat v-show="showChat" />

        <level-up />

        <docked-menu v-if="dockedMenu" />

        <loading v-if="loading" />
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Globals functions
import { functions } from './functions.js';
import { store } from './store/index.js';

// Components
import chat from './components/chat/chat.vue';
import charInfoTop from './components/char-info-top/char-info-top.vue';
import dockedMenu from './components/docked-menu/docked-menu.vue';
import loading from './components/loading/loading.vue';
import levelUp from './components/level-up/level-up.vue';

export default {
    name: 'app',
    components: {
        chat,
        charInfoTop,
        dockedMenu,
        loading,
        levelUp
    },
    store: store,
    data() {
        return {
            loading: true,
            showChat: false
        };
    },
    computed: {
        ...mapGetters(['dockedMenu'])
    },
    watch: {
        $route: {
            immediate: true,
            handler() {
                this.showHideChat();
            }
        }
    },
    mounted() {
        // If there are no character data, generate it
        if (functions.storage('get', 'character')) {
            this.$store.commit('setCharacterData', functions.storage('get', 'character'));
        } else {
            const generatedCharacter = {
                name: `Guest_${Math.random()}`,
                gender: 'm',
                headStyle: 1,
                baseLevel: 1,
                jobLevel: 1,
                baseExp: 0,
                jobExp: 0,
                jobId: 0,
                stats: {
                    str: 1,
                    dex: 1,
                    int: 1,
                    vit: 1,
                    wis: 1,
                    luk: 1
                },
                statusPoints: 48,
                skillPoints: 0,
                skills: {},
                location: 1,
                saveLocation: 1,
                hp: 1,
                mp: 1,
                zeny: 0
            };

            functions.storage('set', 'character', generatedCharacter, 604800000 * 90);

            this.$store.commit('setCharacterData', generatedCharacter);
        }

        // If there are no inventory data, generate it
        if (functions.storage('get', 'inventory')) {
            this.$store.commit('setInventoryData', functions.storage('get', 'inventory'));
        } else {
            const generatedInventory = [
                {
                    // Knife
                    id: 1,
                    amount: 1,
                },
                {
                    // Cotton shirt
                    id: 2000,
                    amount: 1
                }
            ];

            functions.storage('set', 'inventory', generatedInventory, 604800000 * 90);

            this.$store.commit('setInventoryData', generatedInventory);
        }

        if (functions.storage('get', 'characterGenerated')) {
            this.$store.commit('displayDockedMenu', true);

            // Redirecting to main game page if ended up on home page
            if (this.$route.path === '/') {
                this.$router.replace('/game');
            }
        } else {
            // If party is not there, placing to home page
            this.$router.replace('/');
        }

        this.removeLoader();
    },
    methods: {
        showHideChat() {
            if (functions.storage('get', 'characterGenerated') && this.$route.path === '/game') {
                this.showChat = true;
            } else {
                this.showChat = false;
            }
        },
        removeLoader() {
            // Remove loader
            this.loading = false;
        }
    }
};
</script>