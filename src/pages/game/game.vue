<template>
    <section :class="characterLocation.toLowerCase()"
        class="game"
    >
        <div class="party">
            <div class="party__slot">+</div>
            <div class="party__slot">+</div>
            <div class="party__slot">+</div>
            <div class="party__slot">+</div>

            <div class="party__name">Party: --</div>
        </div>

        <div v-if="showActions"
            class="game__actions"
        >
            <hunt-actions v-if="outsideActions"
                :class="{'game__action--disabled': huntStatus || travelingToLocation || restInProgress}"
            />

            <!--<div v-if="outsideActions"
                :class="{'game__action--disabled': huntStatus || travelingToLocation || restInProgress}"
                class="game__action"
                @click="trackMonster()"
            >
                <img src="/dist/assets/images/eye.png">
                <span class="game__action__name">Track down</span>
            </div>-->

            <kafra-actions v-if="!outsideActions"
                :class="{'game__action--disabled': huntStatus || travelingToLocation || restInProgress}"
            />
            <inn-actions v-if="!outsideActions"
                :class="{'game__action--disabled': huntStatus || travelingToLocation || restInProgress}"
            />
            <shop-actions v-if="!outsideActions"
                :class="{'game__action--disabled': huntStatus || travelingToLocation || restInProgress}"
            />

            <div v-if="huntStatus || travelingToLocation || restInProgress"
                class="game__action-in-progress"
            >
                <div v-if="travelingToLocation">Traveling in Progress</div>
                <div v-if="restInProgress">Rest in Progress</div>
                <div v-if="huntStatus">
                    <div>Hunt in progress</div>
                    <div>{{ huntStatusTimerDisplay }}</div>
                    <button v-if="!retreatFromHunt"
                        class="btn btn-secondary"
                        @click="initRetreatFromHunt()"
                    >Retreat from hunt</button>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import kafraActions from '../../components/kafra-actions/kafra-actions.vue';
import innActions from '../../components/inn-actions/inn-actions.vue';
import shopActions from '../../components/shop-actions/shop-actions.vue';
import huntActions from '../../components/hunt-actions/hunt-actions.vue';

const gamePage = {
    components: {
        kafraActions,
        innActions,
        shopActions,
        huntActions
    },
    data() {
        return {
            showActions: false,
            outsideActions: false,
            huntInterval: null,
            huntStatusTimerDisplay: '*',
            retreatFromHunt: false,
        };
    },
    computed: {
        ...mapGetters([
            'characterLocation',
            'huntStatus',
            'huntEndTimer',
            'travelingToLocation',
            'restInProgress',
            'socketConnection',
        ])
    },
    watch: {
        characterLocation: {
            immediate: true,
            handler() {
                // Request to get location information from the server
                if (mo.socket) {
                    mo.socket.emit('getCurrentMapLocationData');
                }
            }
        },
        socketConnection: {
            immediate: true,
            handler() {
                if (this.socketConnection) {
                    this.setUpSocketEvents();
                    this.checkHuntState();
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
        }
    },
    beforeDestroy() {
        if (mo.socket) {
            mo.socket.off('getCurrentMapLocationDataComplete');
            mo.socket.off('retreatFromHuntComplete');
        }
    },
    methods: {
        setUpSocketEvents() {
            mo.socket.on('getCurrentMapLocationDataComplete', (response) => {
                const location = response.location;

                // Decide if we're outside of the city or in, this will change game actions
                if (location.level) {
                    this.outsideActions = true;
                } else {
                    this.outsideActions = false;
                }

                this.showActions = true;
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
            this.huntStatusTimerDisplay = 'Retreating from the Hunt...';
            this.retreatFromHunt = true;
            if (this.huntInterval) {
                clearInterval(this.huntInterval);
            }
        },
        checkHuntState() {
            // If fight status is on, we need to display active hunt details
            mo.socket.emit('getHunt');
        },
        runHuntTimer() {
            this.huntInterval = setInterval(() => {
                // Calculating remaining time every time from the date param
                const remainingTime = Math.floor((this.huntEndTimer - new Date().getTime()) / 1000);

                // If timer reached 0, switch user locations and unlock the map
                if (remainingTime <= 0) {
                    this.huntStatusTimerDisplay = 'Finishing the Hunt...';
                    this.retreatFromHunt = true;

                    clearInterval(this.huntInterval);

                    return true;
                }

                // Making display of resting time user friendly
                const minutes = Math.floor(remainingTime / 60);
                let seconds = remainingTime - minutes * 60;

                if (seconds <= 9) {
                    seconds = `0${seconds}`;
                }

                this.huntStatusTimerDisplay = `${minutes}:${seconds}`;
            }, 1000);
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