<template>
    <section :class="characterLocation.toLowerCase()"
        class="game"
    >
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
                        :gender="member.gender"
                        :just-head="true"
                    />
                    <div class="game__party__slot__bar">
                        <div :style="{ 'width': `${Math.floor(member.hp / member.maxHp * 100) || 100}%` }"
                            class="game__party__slot__bar__hp"
                        />
                    </div>
                    <div :class="{'game__party__slot__online--online': member.online, 'game__party__slot__online--offline': !member.online}"
                        class="game__party__slot__online"
                    />
                </template>
                <template v-else>+</template>
            </div>

            <div class="game__party__name">Party: {{ partyName || '--' }}</div>
        </div>

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

        <div v-if="showActions"
            class="game__actions"
        >
            <hunt-actions v-if="huntAvailable"
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

            <kafra-actions v-if="kafraAvailable"
                :class="{'game__action--disabled': huntStatus || travelingToLocation || restInProgress}"
            />
            <inn-actions v-if="innAvailable"
                :class="{'game__action--disabled': huntStatus || travelingToLocation || restInProgress}"
            />
            <shop-actions v-if="shopsAvailable"
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
import kafraActions from '@components/kafra-actions/kafra-actions.vue';
import innActions from '@components/inn-actions/inn-actions.vue';
import shopActions from '@components/shop-actions/shop-actions.vue';
import huntActions from '@components/hunt-actions/hunt-actions.vue';
import avatar from '@components/avatar/avatar.vue';

const gamePage = {
    components: {
        kafraActions,
        innActions,
        shopActions,
        huntActions,
        avatar
    },
    data() {
        return {
            showActions: false,
            huntInterval: null,
            huntStatusTimerDisplay: '*',
            retreatFromHunt: false,
            partyMembersList: [null, null, null, null],
            huntAvailable: false,
            kafraAvailable: false,
            innAvailable: false,
            shopsAvailable: false,
        };
    },
    computed: {
        ...mapGetters([
            'characterId',
            'characterLocation',
            'huntStatus',
            'huntEndTimer',
            'travelingToLocation',
            'restInProgress',
            'socketConnection',
            'partyName',
            'partyMembers'
        ])
    },
    watch: {
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
        clearInterval(this.huntInterval);

        if (mo.socket) {
            mo.socket.off('getCurrentMapLocationDataComplete');
            mo.socket.off('retreatFromHuntComplete');
        }
    },
    methods: {
        partyClick() {
            // Need to create a party
            this.$router.push('/party');
        },
        setUpSocketEvents() {
            mo.socket.on('getCurrentMapLocationDataComplete', (response) => {
                const location = response.location;

                // Decide if we're outside of the city or in, this will change game actions
                if (location.monsters) {
                    this.huntAvailable = true;
                } else {
                    this.huntAvailable = false;
                }

                if (location.kafra) {
                    this.kafraAvailable = true;
                } else {
                    this.kafraAvailable = false;
                }

                if (location.inn) {
                    this.innAvailable = true;
                } else {
                    this.innAvailable = false;
                }

                if (location.shops) {
                    this.shopsAvailable = true;
                } else {
                    this.shopsAvailable = false;
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