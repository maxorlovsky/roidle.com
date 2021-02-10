<template>
    <section :class="characterLocation.toLowerCase()"
        class="game"
    >
        <loading v-if="loading" />
        <template v-else>
            <div class="game__party"
                @click="partyClick()"
            >
                <div v-for="(member, index) in partyMembersList"
                    :key="index"
                    class="game__party__slot"
                >
                    <template v-if="member">
                        <div class="game__party__slot__name">{{ member.name }}</div>
                        <avatar :head-style="member.headStyle"
                            :head-color="member.headColor"
                            :head-gears="member.headGears"
                            :gender="member.gender"
                            :just-head="true"
                        />
                        <div class="game__party__slot__bar">
                            <div :style="{ 'width': `${Math.floor(member.hp / member.maxHp * 100) || 0}%` }"
                                class="game__party__slot__bar__hp"
                            />
                        </div>
                        <div :class="{'game__party__slot__online--online': member.online, 'game__party__slot__online--offline': !member.online}"
                            class="game__party__slot__online"
                        />
                    </template>
                    <template v-else>+</template>
                </div>

                <div class="game__party__name">{{ $t('global.party') }}: {{ partyName || '--' }}</div>
            </div>

            <div class="game__additions">
                <router-link to="/settings"
                    class="game__settings game-icon"
                >
                    <i class="icon icon-settings" />
                </router-link>

                <router-link to="/hunt-configuration"
                    class="game__hunt-config game-icon"
                >
                    <i class="icon icon-sword" />
                </router-link>

                <div v-if="characterCrafting || characterTraveling"
                    class="game__trade game-icon game__additions--disabled"
                >
                    <i class="icon icon-trade" />
                </div>
                <router-link v-else-if="characterSkills[1] >= 4"
                    to="/trading-list"
                    class="game__trade game-icon"
                >
                    <i class="icon icon-trade" />
                </router-link>

                <div v-if="characterSkills[28] >= 1 && huntStatus"
                    class="game__transmutation game-icon game__additions--disabled"
                >
                    <i class="icon icon-transmutation" />
                </div>
                <router-link v-else-if="characterSkills[28] >= 1"
                    to="/transmute-items"
                    class="game__transmutation game-icon"
                >
                    <i class="icon icon-transmutation" />
                </router-link>
            </div>

            <div v-if="showActions"
                class="game__actions"
            >
                <hunt-actions v-if="huntAvailable"
                    :class="{
                        'game__action--disabled': huntStatus || characterTraveling || characterResting || characterCrafting,
                        'game__action--prioritize': gameModal === 'hunt'
                    }"
                />

                <!--<div v-if="outsideActions"
                    :class="{'game__action--disabled': huntStatus || characterTraveling || characterResting}"
                    class="game__action"
                    @click="trackMonster()"
                >
                    <img :src="`${serverUrl}/dist/assets/images/eye.png`">
                    <span class="game__action__name">Track down</span>
                </div>-->

                <kafra-actions v-if="kafraAvailable"
                    :class="{
                        'game__action--disabled': huntStatus || characterTraveling || characterResting,
                        'game__action--prioritize': gameModal === 'kafra'
                    }"
                />
                <inn-actions v-if="innAvailable"
                    :disabled="characterCrafting"
                    :class="{
                        'game__action--disabled': huntStatus || characterTraveling || characterResting || characterCrafting,
                        'game__action--prioritize': gameModal === 'inn'
                    }"
                />
                <shop-actions v-if="shopsAvailable"
                    :class="{
                        'game__action--disabled': huntStatus || characterTraveling || characterResting || characterCrafting,
                        'game__action--prioritize': gameModal === 'shop'
                    }"
                />
                <craft-actions v-if="craftAvailable"
                    :class="{
                        'game__action--disabled': huntStatus || characterTraveling || characterResting,
                        'game__action--prioritize': gameModal === 'craft'
                    }"
                />
                <dungeon-actions v-if="dungeonAvailable"
                    :class="{
                        'game__action--disabled': huntStatus || characterTraveling || characterResting || characterCrafting,
                        'game__action--prioritize': gameModal === 'dungeon'
                    }"
                />
                <ship-actions v-if="shipAvailable"
                    :class="{
                        'game__action--disabled': huntStatus || characterTraveling || characterResting || characterCrafting,
                        'game__action--prioritize': gameModal === 'ship'
                    }"
                />

                <div v-if="huntStatus || characterTraveling || characterResting"
                    class="game__action-in-progress"
                >
                    <div v-if="characterTraveling">
                        <div>{{ $t('game.travelInProgress') }}</div>
                        <button v-if="!cancelingTravel"
                            class="btn btn-secondary"
                            @click="cancelTravel()"
                        >{{ $t('game.cancelTravel') }}</button>
                    </div>
                    <div v-if="characterResting">
                        <div>{{ $t('game.restInProgress') }}</div>
                        <button v-if="!cancelingRest"
                            class="btn btn-secondary"
                            @click="cancelRest()"
                        >{{ $t('game.cancelRest') }}</button>
                    </div>
                    <div v-if="huntStatus">
                        <div>{{ $t('game.huntInProgress') }}</div>
                        <div>{{ huntStatusTimerDisplay }}</div>
                        <button v-if="!retreatFromHunt"
                            class="btn btn-secondary"
                            @click="initRetreatFromHunt()"
                        >{{ $t('game.cancelHunt') }}</button>
                    </div>
                </div>
            </div>

            <puzzle-challenge v-if="showChallenge" />
            <trade-window-request v-if="showTradeRequest" />

            <ul v-if="enableXmas"
                class="snow"
            >
                <li />
                <li />
            </ul>
        </template>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import loading from '@components/loading/loading.vue';
import kafraActions from '@components/kafra-actions/kafra-actions.vue';
import innActions from '@components/inn-actions/inn-actions.vue';
import shopActions from '@components/shop-actions/shop-actions.vue';
import huntActions from '@components/hunt-actions/hunt-actions.vue';
import craftActions from '@components/craft-actions/craft-actions.vue';
import dungeonActions from '@components/dungeon-actions/dungeon-actions.vue';
import puzzleChallenge from '@components/puzzle-challenge/puzzle-challenge.vue';
import avatar from '@components/avatar/avatar.vue';
import tradeWindowRequest from '@components/trade-window-request/trade-window-request.vue';
import shipActions from '@components/ship-actions/ship-actions.vue';

const gamePage = {
    components: {
        loading,
        kafraActions,
        innActions,
        shopActions,
        huntActions,
        dungeonActions,
        puzzleChallenge,
        avatar,
        tradeWindowRequest,
        craftActions,
        shipActions
    },
    data() {
        return {
            loading: true,
            showActions: false,
            huntInterval: null,
            huntStatusTimerDisplay: '*',
            retreatFromHunt: false,
            partyMembersList: [null, null, null, null],
            huntAvailable: false,
            kafraAvailable: false,
            innAvailable: false,
            shopsAvailable: false,
            cancelingRest: false,
            dungeonAvailable: false,
            cancelingTravel: false,
            showChallenge: false,
            showTradeRequest: false,
            craftAvailable: false,
            shipAvailable: false,
            enableXmas: false
        };
    },
    computed: {
        ...mapGetters([
            'characterId',
            'characterLocation',
            'huntStatus',
            'huntEndTimer',
            'socketConnection',
            'partyName',
            'partyMembers',
            'puzzleChallenge',
            'currentLocation',
            'characterSkills',
            'tradeRequestId',
            'characterCrafting',
            'characterTraveling',
            'characterResting',
            'serverUrl',
            'gameModal'
        ])
    },
    watch: {
        characterId: {
            immediate: true,
            handler() {
                if (this.characterId) {
                    this.loading = false;
                }
            }
        },
        tradeRequestId: {
            immediate: true,
            handler() {
                if (this.tradeRequestId) {
                    this.showTradeRequest = true;
                } else {
                    this.showTradeRequest = false;
                }
            }
        },
        partyMembers: {
            immediate: true,
            handler() {
                // Reset party member list
                this.partyMembersList = [null, null, null, null];

                if (!this.partyMembers || !this.partyMembers.length) {
                    return false;
                }

                const partyMembers = [];

                // Loop through members and remove the player himself, to not overlap
                for (let i = 0; i < 5; i++) {
                    // In case party member is the same member, we ignore him and don't mention him in the list
                    if (this.partyMembers[i] && this.partyMembers[i].id === this.characterId) {
                        // eslint-disable-next-line
                        continue;
                    } else if (this.partyMembers[i]) {
                        partyMembers.push(this.partyMembers[i]);
                    } else {
                        partyMembers.push(null);
                    }
                }

                this.partyMembersList = partyMembers;
            }
        },
        socketConnection: {
            immediate: true,
            handler() {
                if (this.socketConnection) {
                    this.setUpSocketEvents();
                }
            }
        },
        huntStatus: {
            immediate: true,
            handler() {
                // Displaying timer and status of the hunt
                if (this.huntStatus === 'hunting') {
                    this.runHuntTimer();
                // In case retreating, just mark hunt as retreat without any timers
                } else if (this.huntStatus === 'retreating') {
                    this.markHuntAsRetreating();
                // Reseting the hunt
                } else {
                    this.huntStatusTimerDisplay = '*';
                    this.retreatFromHunt = false;
                    clearInterval(this.huntInterval);
                    this.huntInterval = null;
                }
            }
        },
        puzzleChallenge: {
            immediate: true,
            handler() {
                if (this.puzzleChallenge) {
                    this.showChallenge = true;
                } else {
                    this.showChallenge = false;
                }
            }
        },
        currentLocation: {
            immediate: true,
            handler() {
                if (this.currentLocation) {
                    // Decide if we're outside of the city or in, this will change game actions
                    if (this.currentLocation.hunt) {
                        this.huntAvailable = true;
                    } else {
                        this.huntAvailable = false;
                    }

                    if (this.currentLocation.kafra) {
                        this.kafraAvailable = true;
                    } else {
                        this.kafraAvailable = false;
                    }

                    if (this.currentLocation.inn) {
                        this.innAvailable = true;
                    } else {
                        this.innAvailable = false;
                    }

                    if (this.currentLocation.shops) {
                        this.shopsAvailable = true;
                    } else {
                        this.shopsAvailable = false;
                    }

                    if (this.currentLocation.craft) {
                        this.craftAvailable = true;
                    } else {
                        this.craftAvailable = false;
                    }

                    if (this.currentLocation.dungeonUp || this.currentLocation.dungeonDown) {
                        this.dungeonAvailable = true;
                    } else {
                        this.dungeonAvailable = false;
                    }

                    if (this.currentLocation.shipTravel) {
                        this.shipAvailable = true;
                    } else {
                        this.shipAvailable = false;
                    }

                    this.showActions = true;
                }
            }
        }
    },
    beforeDestroy() {
        clearInterval(this.huntInterval);

        if (mo.socket) {
            mo.socket.off('interruptTravelComplete');
            mo.socket.off('retreatFromHuntComplete');
        }
    },
    methods: {
        cancelTravel() {
            mo.socket.emit('interruptTravel');
        },
        cancelRest() {
            mo.socket.emit('interruptRest');
        },
        partyClick() {
            // Need to create a party
            this.$router.push('/party');
        },
        setUpSocketEvents() {
            mo.socket.on('interruptTravelComplete', (response) => {
                if (response) {
                    this.$store.commit('travelingComplete');
                }
            });

            mo.socket.on('retreatFromHuntComplete', () => {
                this.markHuntAsRetreating();

                // Updating status prematurely, to not show
                this.$store.commit('huntStatus', {
                    status: 'retreating',
                    timeFinish: null
                });
            });
        },
        markHuntAsRetreating() {
            // Marking hunt as retreated
            this.huntStatusTimerDisplay = this.$t('game.retreatingFromHunt');
            this.retreatFromHunt = true;
            if (this.huntInterval) {
                clearInterval(this.huntInterval);
            }
        },
        runHuntTimer() {
            this.huntInterval = setInterval(() => {
                // Calculating remaining time every time from the date param
                const remainingTime = Math.floor((this.huntEndTimer - new Date().getTime()) / 1000);

                // If timer reached 0, switch user locations and unlock the map
                if (remainingTime <= 0) {
                    this.huntStatusTimerDisplay = this.$t('game.finishingHunt');
                    this.retreatFromHunt = true;

                    clearInterval(this.huntInterval);

                    return true;
                }

                this.huntStatusTimerDisplay = this.timeConversion(remainingTime);
            }, 1000);
        },
        timeConversion(miliseconds) {
            let seconds = Math.floor((miliseconds) % 60);
            let minutes = Math.floor((miliseconds / 60) % 60);
            let hours = Math.floor((miliseconds / (60 * 60)) % 24);

            if (hours < 10) {
                hours = `0${hours}`;
            }

            if (minutes < 10) {
                minutes = `0${minutes}`;
            }

            if (seconds < 10) {
                seconds = `0${seconds}`;
            }

            return `${hours}:${minutes}:${seconds}`;
        },
        initRetreatFromHunt() {
            // If fight status is on, we need to display active hunt details
            mo.socket.emit('retreatFromHunt');
        }
    }
};

// Routing
mo.routes.push({
    path: '/game',
    component: gamePage
});

export default gamePage;
</script>