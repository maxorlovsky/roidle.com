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
import axios from 'axios';

// Globals functions
import { functions } from '@src/functions.js';
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
        ...mapGetters(['dockedMenu', 'showChat', 'socketConnection', 'characterStats'])
    },
    watch: {
        socketConnection() {
            if (this.$route.path !== '/' && this.socketConnection) {
                this.setUpSocketEvents();
            }

            if (this.socketConnection && functions.storage('get', 'session')) {
                this.setUpMainSocketEvents();
            }
        }
    },
    async mounted() {
        // We ping the server, to know that it's alive, in case it isn't we're redirecting user to server-down page
        try {
            await axios.get('/api/ping');
        } catch (error) {
            this.$router.replace('/server-down');
        } finally {
            this.removeLoader();
        }

        // In case it's not a home page that we're trying to get into we will try
        if (!['/', '/server-down'].includes(this.$route.path) && functions.storage('get', 'session')) {
            this.$router.push('/game');
            await this.reconnect();
        }

        this.removeLoader();

        // If up to this point user still don't have socket connection, we must redirect him to home page
        if (!mo.socket && !['/', '/server-down'].includes(this.$route.path)) {
            this.$router.replace('/');
        }
    },
    methods: {
        setUpMainSocketEvents() {
            mo.socket.on('equipmentUpdate', (response) => {
                if (response.message) {
                    this.$store.commit('sendChat', [
                        {
                            type: 'system',
                            character: 'System',
                            message: response.message
                        }
                    ]);
                }

                this.$store.commit('setEquipment', response.equipment);

                // Trigger recalculations of stats
                mo.socket.emit('getCharacterStatsAttributes', this.characterStats);
            });

            mo.socket.on('getCharacterStatsAttributesComplete', (response) => {
                this.$store.commit('setCharacterData', {
                    bonusStats: response.bonusStats,
                    attributes: response.attributes
                });
            });

            mo.socket.on('inventoryUpdate', (response) => {
                if (response.message) {
                    this.$store.commit('sendChat', [
                        {
                            type: 'system',
                            character: 'System',
                            message: response.message
                        }
                    ]);
                }

                this.$store.commit('setInventoryData', {
                    inventory: response.inventory,
                    inventoryWeight: response.inventoryWeight || null
                });
            });

            mo.socket.on('characterDied', (response) => {
                this.$store.commit('setCharacterData', {
                    baseExp: response.baseExp,
                    jobExp: response.jobExp,
                    baseExpPercentage: response.baseExpPercentage,
                    jobExpPercentage: response.jobExpPercentage,
                    hp: response.hp,
                    mp: response.mp,
                    locationId: response.locationId,
                    location: response.location,
                });
            });
        },
        setUpSocketEvents() {
            mo.socket.emit('reconnect', functions.storage('get', 'session'));

            mo.socket.on('disconnect', () => {
                this.serverWentDown = true;
                this.$store.commit('displayDockedMenu', false);
                this.$store.commit('showChat', false);
                this.$store.commit('socketConnection', false);
            });

            mo.socket.on('reconnectFail', () => {
                console.error('reconnect fail');
                console.error('sending to / page');
                mo.socket.disconnect();
                mo.socket = null;
                this.$router.push('/');
            });

            // If socket is registered, we're progressing by fetching user data
            mo.socket.on('selectCharacterComplete', (response) => {
                this.$store.commit('characterInit', response);

                this.$store.commit('displayDockedMenu', true);
                this.$store.commit('showChat', true);
            });
        },
        async reconnect() {
            mo.socket = await io({
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: Infinity
            });

            this.$store.commit('socketConnection', true);

            mo.socket.emit('reconnectRequest', {
                sessionToken: functions.storage('get', 'session'),
                characterId: functions.storage('get', 'selectedCharacter')
            });
        },
        removeLoader() {
            // Remove loader
            this.loading = false;
        }
    }
};
</script>