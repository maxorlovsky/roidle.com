<template>
    <section id="app"
        class="app"
    >
        <loading v-if="loading" />
        <template v-else>
            <char-info-top v-if="dockedMenu" />

            <router-view :class="{'docked-menu-open': dockedMenu}"
                class="body-content"
            />

            <chat v-show="showChat" />

            <level-up />

            <docked-menu v-if="dockedMenu" />

            <div v-if="serverWentDown"
                class="modal"
            >Disconnected from server</div>
            <div v-if="serverWentDown"
                class="server-down-modal"
            />
        </template>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Globals functions
import { functions } from './functions.js';
import { store } from './store/index.js';
import io from 'socket.io-client';

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
            serverInitialCheck: true,
            serverWentDown: false
        };
    },
    computed: {
        ...mapGetters(['dockedMenu', 'showChat'])
    },
    mounted() {
        // Saving socket connection to vuex
        mo.socket = io();

        mo.socket.on('connect', () => {
            if (functions.storage('get', 'session')) {
                mo.socket.emit('authenticate', functions.storage('get', 'session'));
            } else {
                mo.socket.emit('register');
            }
        });

        mo.socket.on('connect_error', () => {
            // We redirect user to server down page only on initial run and check if he then disconnected, otherwise handle it on disconnect event
            if (this.serverInitialCheck) {
                this.$router.replace('/server-down');
            }

            this.removeLoader();
        });

        mo.socket.on('disconnect', () => {
            this.serverWentDown = true;
        });

        mo.socket.on('authenticationStatus', (params) => {
            // Just in case user comes back after disconnect, hiding disconnect modal
            this.serverWentDown = false;
            // Turning off initial check as now it means that connection was successful
            this.serverInitialCheck = false;

            // Check if we received session token and auth success
            // If all correct, update session token
            if (params.status && params.sessionToken) {
                functions.storage('set', 'session', params.sessionToken);
            }

            // Get player/char/eq/inventory/etc data and parse it into vuex
            if (params.status) {
                params.character.stats = JSON.parse(params.character.stats);
                params.character.skills = JSON.parse(params.character.skills);
                params.character.equipment = JSON.parse(params.character.equipment);
                params.character.inventory = JSON.parse(params.character.inventory);

                this.$store.commit('setCharacterData', params.character);
                this.$store.commit('setInventoryData', params.character.inventory);

                // If character name is Guest, relocate to home screen
                if (params.character.name === 'Guest') {
                    this.$router.replace('/');
                } else {
                    this.$store.commit('displayDockedMenu', true);
                    this.$store.commit('showChat', true);

                    this.$router.replace('/game');
                }
            } else {
                console.error('[ERROR] Something went wrong, can not create character or login');

                this.$router.replace('/');
            }

            this.removeLoader();
        });
    },
    methods: {
        removeLoader() {
            // Remove loader
            this.loading = false;
        }
    }
};
</script>