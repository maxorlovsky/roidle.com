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
            <div v-if="outsideActions"
                :class="{'game__action--disabled': fightStatus || travelingToLocation || restInProgress}"
                class="game__action"
                @click="showFightModal = true"
            >
                <img src="/dist/assets/images/sword.png">
                <span class="game__action__name">Hunt</span>
            </div>

            <!--<div v-if="outsideActions"
                :class="{'game__action--disabled': fightStatus || travelingToLocation || restInProgress}"
                class="game__action"
                @click="trackMonster()"
            >
                <img src="/dist/assets/images/eye.png">
                <span class="game__action__name">Track down</span>
            </div>-->

            <kafra-actions v-if="!outsideActions"
                :class="{'game__action--disabled': fightStatus || travelingToLocation || restInProgress}"
            />
            <inn-actions v-if="!outsideActions"
                :class="{'game__action--disabled': fightStatus || travelingToLocation || restInProgress}"
            />
            <shop-actions v-if="!outsideActions"
                :class="{'game__action--disabled': fightStatus || travelingToLocation || restInProgress}"
            />

            <div v-if="fightStatus"
                class="game__action-in-progress"
            >
                <div>Hunt in progress</div>
                <div>{{ fightTimer }}</div>
                <button v-if="!cancelFight"
                    class="btn btn-secondary"
                    @click="stopHunt()"
                >Cancel hunt</button>
            </div>

            <div v-if="travelingToLocation || restInProgress"
                class="game__action-in-progress"
            >
                <div>{{ travelingToLocation ? 'Traveling' : 'Rest' }} in Progress</div>
            </div>
        </div>

        <div v-if="showFightModal"
            class="modal"
        >
            <div class="modal__header">Confirm hunt</div>
            <div class="modal__content">
                <p>Position</p>
                <select>
                    <option>Frontline</option>
                    <option>Middleline</option>
                    <option>Backline</option>
                </select>

                <p>Time</p>
                <button class="btn btn-primary"
                    @click="huntTime = 60"
                >1 min</button>

                <button class="btn btn-primary"
                    @click="huntTime = 300"
                >5 min</button>

                <button class="btn btn-primary"
                    @click="huntTime = 600"
                >10 min</button>

                <template v-if="enableLongerHunt">
                    <button class="btn btn-primary"
                        @click="huntTime = 1800"
                    >30 min</button>
                    <button class="btn btn-primary"
                        @click="huntTime = 2700"
                    >45 min</button>
                    <button class="btn btn-primary"
                        @click="huntTime = 3600"
                    >1 hour</button>
                </template>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="cancelHunt()"
                >Cancel</button>
                <button :disabled="!huntTime"
                    :class="{'disabled': !huntTime}"
                    class="btn btn-success"
                    @click="startHunt()"
                >Start</button>
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

const gamePage = {
    components: {
        kafraActions,
        innActions,
        shopActions
    },
    data() {
        return {
            showActions: false,
            showFightModal: false,
            showKafraModal: false,
            fightTimer: '',
            interval: null,
            outsideActions: false,
            cancelFight: false,
            huntTime: null,
            enableLongerHunt: false
        };
    },
    computed: {
        ...mapGetters([
            'characterLocation',
            'fightStatus',
            'travelingToLocation',
            'restInProgress',
            'socketConnection',
            'characterSkills'
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
        characterSkills: {
            immediate: true,
            handler() {
                if (this.characterSkills[1] >= 8) {
                    this.enableLongerHunt = true;
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
        }
    },
    beforeDestroy() {
        if (mo.socket) {
            mo.socket.off('getCurrentMapLocationDataComplete');
            mo.socket.off('startHuntComplete');
            mo.socket.off('stopHuntComplete');
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

            mo.socket.on('startHuntComplete', (response) => {
                this.cancelFight = false;
                this.fightTimer = '';

                // Marking character as in fight status
                if (response && response.status) {
                    this.$store.commit('fightStatus', true);

                    this.interval = setInterval(() => {
                        // Calculating remaining time every time from the date param
                        const remainingTime = Math.floor((response.timeFinish - new Date().getTime()) / 1000);

                        // If timer reached 0, switch user locations and unlock the map
                        if (remainingTime <= 0) {
                            this.fightTimer = 'Finishing the Hunt...';
                            this.cancelFight = true;

                            clearInterval(this.interval);

                            return true;
                        }

                        // Making display of resting time user friendly
                        const minutes = Math.floor(remainingTime / 60);
                        let seconds = remainingTime - minutes * 60;

                        if (seconds <= 9) {
                            seconds = `0${seconds}`;
                        }

                        this.fightTimer = `${minutes}:${seconds}`;
                    }, 1000);
                }
            });

            mo.socket.on('stopHuntComplete', () => {
                this.$store.commit('fightStatus', false);
            });

            // After all events are set, check just in case
        },
        checkHuntState() {
            // If fight status is on, we need to display active hunt details
            mo.socket.emit('getHunt');
        },
        stopHunt() {
            this.cancelFight = true;
        },
        cancelHunt() {
            this.showFightModal = false;
            this.huntTime = null;
        },
        startHunt() {
            // If fight in progress, we don't start another one
            if (this.fightStatus) {
                return false;
            }

            this.showFightModal = false;

            // Start hunt for 1 minute
            mo.socket.emit('startHunt', this.huntTime);
        },
        stopFight() {
            // Stopping the fight
            this.$store.commit('fightStatus', false);
            // Reseting round time
            this.roundTime = 10000;
            // Reset cancel fight
            this.cancelFight = false;
            // Stopping timer
            clearInterval(this.interval);
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