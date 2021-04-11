<template>
    <section id="app"
        :class="{'app--game': characterId}"
        class="app"
    >
        <loading v-if="loading" />
        <div v-else
            class="game-block"
        >
            <top-navigation v-if="!dockedMenu" />

            <char-info-top v-if="dockedMenu" />

            <router-view :class="{'docked-menu-open': dockedMenu, 'body-content--game': characterId}"
                class="body-content"
            />

            <chat v-if="resetComponent"
                v-show="enableChat"
            />

            <level-up />

            <bgm v-if="resetComponent && enableBgm" />

            <item-info />
            <skill-info />

            <trade-window-request v-if="dockedMenu" />

            <tutorial v-if="showTutorial" />
            <tutorial-blocker v-if="showTutorial" />

            <docked-menu v-if="dockedMenu" />

            <a v-if="loginClosed"
                href="/"
                class="modal"
            >
                {{ $t('app.loginClosed') }}
            </a>
            <a v-if="loggedInFromAnotherSource"
                href="/"
                class="modal"
            >
                {{ $t('app.loggedInFromAnotherSource') }}
            </a>
            <div v-if="serverWentDown"
                class="modal"
                @click="reload()"
            >
                {{ $t('app.serverWentDown') }}
                <div class="app__disconnect-button">
                    <button :disabled="buttonLoading"
                        class="btn game-button"
                    >
                        {{ $t('app.reconnect') }}
                    </button>
                </div>
            </div>

            <a v-if="loginClosed || loggedInFromAnotherSource"
                href="/"
                class="server-down-modal"
            />
            <div v-if="serverWentDown"
                class="server-down-modal"
                @click="reconnect()"
            />
        </div>

        <footer-component v-if="!dockedMenu" />
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters, mapActions } from 'vuex';
import axios from 'axios';
import { io } from 'socket.io-client';

// Utilities
import { functions } from '@utils/functions.js';
import { store } from './store/index.js';

// Config
import ioConfig from '@config/io.json';

// Components
import bgm from '@components/bgm/bgm.vue';
import chat from '@components/chat/chat.vue';
import charInfoTop from '@components/char-info-top/char-info-top.vue';
import dockedMenu from '@components/docked-menu/docked-menu.vue';
import loading from '@components/loading/loading.vue';
import levelUp from '@components/level-up/level-up.vue';
import itemInfo from '@components/item-info/item-info.vue';
import skillInfo from '@components/skill-info/skill-info.vue';
import tutorial from '@components/tutorial/tutorial.vue';
import tutorialBlocker from '@components/tutorial/tutorial-blocker.vue';
import tradeWindowRequest from '@components/trade-window-request/trade-window-request.vue';
import footerComponent from '@components/footer/footer.vue';
import topNavigation from '@components/top-navigation/top-navigation.vue';

export default {
    name: 'app',
    components: {
        bgm,
        chat,
        charInfoTop,
        dockedMenu,
        loading,
        levelUp,
        itemInfo,
        skillInfo,
        tutorial,
        tutorialBlocker,
        tradeWindowRequest,
        footerComponent,
        topNavigation
    },
    store: store,
    data() {
        return {
            loading: true,
            buttonLoading: false,
            serverInitialCheck: true,
            serverWentDown: false,
            loggedInFromAnotherSource: false,
            resetComponent: true,
            showTutorial: false,
            loginClosed: false,
            enableBgm: true
        };
    },
    computed: {
        ...mapGetters([
            'dockedMenu',
            'enableChat',
            'socketConnection',
            'characterStats',
            'resetChat',
            'characterBaseLevel',
            'closeTutorial',
            'characterId',
            'partyMembersIds',
            'pushNotification'
        ])
    },
    watch: {
        $route: {
            immediate: true,
            handler() {
                // Check if user is on main page and characterId is present, it means that on back button something went wrong and user actually went back to home screen
                if (this.$route.path === '/' && this.characterId) {
                    // In this case we log user out
                    this.$store.commit('displayDockedMenu', false);

                    // Logout from character
                    functions.storage('remove', 'selectedCharacter');

                    this.$store.commit('socketConnection', false);

                    this.$nextTick(() => {
                        this.$store.commit('resetState');

                        if (mo.socket) {
                            mo.socket.emit('exit');
                            mo.socket = null;
                        }
                    });
                }
            }
        },
        characterId() {
            if (this.socketConnection) {
                mo.socket.emit('getParty');
            }
        },
        socketConnection() {
            // In case socket connection is on, we need to put it socket event
            if (this.socketConnection) {
                this.setUpSocketEvents();
            } else {
                // In case remove socket need to be triggered, we trigger it just in case
                this.removeSocketEvents();
            }

            if (this.socketConnection && functions.storage('get', 'session')) {
                this.setUpMainSocketEvents();
            }
        },
        resetChat() {
            // If reset chat was sent, it means that user logged out to char select, we need to reset bgm component
            this.resetComponent = false;
            this.$nextTick(() => {
                this.resetComponent = true;
            });
        },
        characterBaseLevel: {
            immediate: true,
            handler() {
                if (this.characterBaseLevel === 1) {
                    this.showTutorial = true;
                }
            }
        },
        closeTutorial() {
            this.showTutorial = false;
        }
    },
    async mounted() {
        // Store mo.serverUrl in vuex for reactivity
        this.$store.commit('serverUrl', mo.serverUrl);

        // We ping the server, to know that it's alive, in case it isn't we're redirecting user to server-down page
        try {
            await axios.get(`${mo.serverUrl}/api/ping?cache=${new Date().getTime()}`);
        } catch (error) {
            this.$router.replace('/server-down');
            this.removeLoader();

            return false;
        }

        this.removeLoader();

        // In case it's public we don't do additional checks and reconnects further down the line
        if (this.$route.path.substr(1, 6) === 'public') {
            // For all public paths we disable music
            this.enableBgm = false;
        } else {
            const ignoredPages = [
                '/',
                '/character-select',
                '/server-down',
                '/public/character',
                '/leaderboards',
                '/terms-and-conditions',
                '/legal'
            ];

            // In case it's not a home page that we're trying to get into we will try
            if (!ignoredPages.includes(this.$route.path) &&
                functions.storage('get', 'session') && functions.storage('get', 'selectedCharacter')
            ) {
                if (this.$route.path !== '/game') {
                    this.$router.push('/game');
                }

                await this.reconnect();
            }

            // If up to this point user still don't have socket connection, we must redirect him to home page
            if (!mo.socket && !ignoredPages.includes(this.$route.path)) {
                this.$router.replace('/');
            }
        }
    },
    methods: {
        ...mapActions([
            'setPartyMembers',
            'removePartyMember'
        ]),

        setUpMainSocketEvents() {
            mo.socket.on('getPreloadedDataComplete', (value) => {
                this.$store.commit('setPreloadedData', value);
            });

            mo.socket.on('huntField', (field) => {
                this.$store.commit('setHuntField', field);
            });

            mo.socket.on('cleanField', () => {
                this.$store.commit('clearHuntField');
            });

            mo.socket.on('acceptTradeComplete', (response) => {
                // In case response is successful we send user to trade page
                if (response) {
                    // Do it as a delayed action, since after store commit destory will be initiated
                    this.$nextTick(() => {
                        this.$router.push('/trading');
                    });
                }
            });

            mo.socket.on('huntUpdate', () => {
                mo.socket.emit('getHunt');
            });

            mo.socket.on('forceBonusStatsRecalculation', () => {
                // Trigger in the events when we require to update user stats, be that there is something with party or some debuffs applied
                mo.socket.emit('characterStatsRecalculation');
            });

            mo.socket.on('characterStatsRecalculationComplete', (response) => {
                if (response) {
                    this.$store.commit('setCharacterData', {
                        bonusStats: response.bonusStats,
                        attributes: response.attributes
                    });
                }
            });

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

            mo.socket.on('zenyUpdate', (zeny) => {
                this.$store.commit('saveZeny', zeny);
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

                this.$store.commit('huntStatus', {
                    status: 'retreating',
                    timeFinish: null
                });

                // We're sending a delayed event to stop hunt completely, since mutation happening at the same time won't reach all of the elements
                setTimeout(() => {
                    this.$store.commit('huntStatus', {
                        status: false,
                        timeFinish: null
                    });
                }, 500);
            });

            mo.socket.on('jobChangeUpdate', (response) => {
                this.$store.commit('setCharacterData', {
                    jobId: response.character.jobId,
                    job: response.character.job,
                    jobLevel: response.character.jobLevel,
                    jobExp: response.character.jobExp,
                    jobExpPercentage: response.character.jobExpPercentage,
                    attributes: response.attributes
                });
            });

            mo.socket.on('loginClosed', () => {
                this.loginClosed = true;
                this.$store.commit('socketConnection', false);
                mo.socket.disconnect();
                mo.socket = null;
            });

            mo.socket.on('kickAnotherLogin', () => {
                this.loggedInFromAnotherSource = true;
                mo.socket.disconnect();
                mo.socket = null;
                this.$store.commit('displayDockedMenu', false);
                this.$store.commit('enableChat', false);
                this.$store.commit('socketConnection', false);
            });

            mo.socket.on('partyMemberUpdate', (membersIds) => {
                // Sometimes it might trigger on logout, so we check if character ID is still there
                if (!this.characterId) {
                    return false;
                }

                mo.socket.emit('getPartyMembers', membersIds);
            });

            mo.socket.on('partyConfigChanged', (response) => {
                this.$store.commit('updateParty', response);
            });

            mo.socket.on('partyMemberRemoved', (memberId) => {
                // Removing member from the store
                this.removePartyMember(memberId);
            });

            mo.socket.on('getPartyComplete', (response) => {
                // In case  there is a party, we send a request to fetch data about party members, all of them
                if (response) {
                    this.$store.dispatch('setParty', response);

                    mo.socket.emit('getPartyMembers', response.members);
                }
            });

            mo.socket.on('getPartyMembersComplete', (response) => {
                this.setPartyMembers(response);
            });

            mo.socket.on('partyInvitationReceived', () => {
                this.$store.commit('newPartyInvite');
            });

            mo.socket.on('kickedFromParty', () => {
                this.$store.commit('leaveParty');
            });

            mo.socket.emit('getPreloadedData');
        },
        setUpSocketEvents() {
            mo.socket.emit('reconnect', functions.storage('get', 'session'));

            mo.socket.on('disconnect', (message) => {
                // Trigger only on server disconnect
                if (message === 'transport close') {
                    this.serverWentDown = true;
                    this.$store.commit('resetState');
                    this.$store.commit('displayDockedMenu', false);
                    this.$store.commit('enableChat', false);
                    this.$store.commit('socketConnection', false);
                }
            });

            mo.socket.on('reconnectFail', () => {
                console.error('reconnect fail');
                console.error('sending to / page');
                mo.socket.disconnect();
                mo.socket = null;
                this.$router.push('/');
                this.serverWentDown = false;
            });

            mo.socket.on('connect_timeout', (timeout) => {
                console.error('TIMEOUT');
                console.error(timeout);
            });

            // If socket is registered, we're progressing by fetching user data
            mo.socket.on('selectCharacterComplete', (response) => {
                if (!response) {
                    alert('Something went wrong while loading character, please contact admin on discord');

                    return false;
                }

                // Triggering another call to fetch inventory
                mo.socket.emit('getInventory');
                // Triggering another call to fetch notifications messages
                mo.socket.emit('getMessages');
                // Triggering another call to fetch chat messages
                mo.socket.emit('getChatMessages');

                this.$store.commit('characterInit', response);

                this.$store.commit('displayDockedMenu', true);
                this.$store.commit('enableChat', true);

                // In case character login successful, we need to send push token ID to the server to check if it exists in the system
                if (this.pushNotification) {
                    mo.socket.emit('notificationRegister', this.pushNotification);
                }

                if (this.$route.path !== '/game') {
                    this.$router.push('/game');
                }

                this.serverWentDown = false;
                this.buttonLoading = false;
            });
        },
        removeSocketEvents() {
            if (mo.socket) {
                mo.socket.off('disconnect');
                mo.socket.off('reconnectFail');
                mo.socket.off('connect_timeout');
                mo.socket.off('selectCharacterComplete');
            }
        },
        reload() {
            if (this.buttonLoading) {
                return false;
            }

            this.buttonLoading = true;

            location.reload();
        },
        async reconnect() {
            if (this.buttonLoading) {
                return false;
            }

            this.buttonLoading = true;

            mo.socket = await io(mo.serverUrl, ioConfig);

            this.$store.commit('socketConnection', true);

            mo.socket.emit('selectCharacter', {
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