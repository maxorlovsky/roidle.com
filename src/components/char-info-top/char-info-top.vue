<template>
    <div class="char-info">
        <div class="char-info-wrapper char-info-wrapper--mobile">
            <avatar :head-style="characterHeadStyle"
                :head-color="characterHeadColor"
                :dye-color="characterDyeColor"
                :gender="characterGender"
                :job="characterJob"
                :framed="true"
                :head-gears="[
                    characterEquipment.head.itemId,
                    characterEquipment.face.itemId,
                    characterEquipment.mouth.itemId
                ]"
            />

            <div class="char-info__description">
                <span class="char-info__description__name">{{ characterName }}</span>
                <span class="char-info__description__job">{{ characterJob }}</span>
            </div>

            <div class="char-info__health">
                <span class="char-info__health__hp"><span>HP:</span> {{ characterHp }} / {{ characterAttributes.maxHp }}</span>
                <div class="char-info__health__bar">
                    <div :style="{ 'width': currentHpPercentage + '%' }"
                        class="char-info__health__bar__hp"
                    />
                </div>
                <span class="char-info__health__mp"><span>MP:</span> {{ characterMp }} / {{ characterAttributes.maxMp }}</span>
                <div class="char-info__health__bar">
                    <div :style="{ 'width': currentMpPercentage + '%' }"
                        class="char-info__health__bar__mp"
                    />
                </div>
            </div>

            <div class="char-info__levels">
                <span class="char-info__levels__base">{{ $t('charInfoTop.baseLevel') }}: {{ characterBaseLevel }} ({{ characterBaseExpPercentage }}%)</span>
                <span class="char-info__levels__job">{{ $t('charInfoTop.jobLevel') }}: {{ characterJobLevel }} ({{ characterJobExpPercentage }}%)</span>
            </div>

            <div class="char-info__location">
                <span v-if="huntingDisplay"
                    class="char-info__location__place"
                >{{ $t('charInfoTop.hunting') }} ({{ huntingDisplay }})</span>
                <span v-else-if="timerDisplay"
                    class="char-info__location__place"
                >{{ timerAction }} ({{ timerDisplay }})</span>
                <span v-else
                    class="char-info__location__place"
                >{{ $t('global.location') }}: {{ characterLocation }}</span>
                <span class="char-info__location__zeny">
                    {{ $t('global.money') }}: {{ characterZeny }} | {{ $t('global.weight') }}:
                    <span :class="{ 'char-info__overweight': weightPercentage >= 90 }">{{ weightPercentage }}%</span>
                </span>
            </div>
        </div>

        <div class="char-info-wrapper char-info-wrapper--desktop">
            <avatar :head-style="characterHeadStyle"
                :head-color="characterHeadColor"
                :dye-color="characterDyeColor"
                :gender="characterGender"
                :job="characterJob"
                :framed="true"
                :head-gears="[
                    characterEquipment.head.itemId,
                    characterEquipment.face.itemId,
                    characterEquipment.mouth.itemId
                ]"
            />

            <div class="char-info__description">
                <div>
                    <span class="char-info__description__name">{{ characterName }}</span>
                    <span class="char-info__description__job">{{ characterJob }}</span>
                </div>
                <div>
                    <span class="char-info__levels__base">B.Lv: {{ characterBaseLevel }} ({{ characterBaseExpPercentage }}%)</span>
                    <span class="char-info__levels__job">J.Lv: {{ characterJobLevel }} ({{ characterJobExpPercentage }}%)</span>
                </div>
                <div>
                    <div class="char-info__location">
                        <span v-if="huntingDisplay"
                            class="char-info__location__place"
                        >{{ $t('charInfoTop.hunting') }} ({{ huntingDisplay }})</span>
                        <span v-else-if="timerDisplay"
                            class="char-info__location__place"
                        >{{ timerAction }} ({{ timerDisplay }})</span>
                        <span v-else
                            class="char-info__location__place"
                        >{{ $t('global.location') }}: {{ characterLocation }}</span>
                        <span class="char-info__location__zeny">
                            {{ $t('global.money') }}: {{ characterZeny }} | {{ $t('global.weight') }}:
                            <span :class="{ 'char-info__overweight': weightPercentage >= 90 }">{{ weightPercentage }}%</span>
                        </span>
                    </div>
                </div>
            </div>

            <div class="char-info__health">
                <span class="char-info__health__hp"><span>HP:</span> {{ characterHp }} / {{ characterAttributes.maxHp }}</span>
                <div class="char-info__health__bar">
                    <div :style="{ 'width': currentHpPercentage + '%' }"
                        class="char-info__health__bar__hp"
                    />
                </div>
                <span class="char-info__health__mp"><span>MP:</span> {{ characterMp }} / {{ characterAttributes.maxMp }}</span>
                <div class="char-info__health__bar">
                    <div :style="{ 'width': currentMpPercentage + '%' }"
                        class="char-info__health__bar__mp"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import avatar from '../avatar/avatar.vue';

export default {
    name: 'char-info-top',
    components: {
        avatar
    },
    data() {
        return {
            location: '',
            timerAction: '',
            timerDisplay: '',
            huntingDisplay: '',
            interval: null,
            baseExpPercentage: '0.00',
            jobExpPercentage: '0.00',
            weightPercentage: 0,
            timerSeconds: 0
        };
    },
    computed: {
        ...mapGetters([
            'characterName',
            'characterJob',
            'characterHeadStyle',
            'characterHeadColor',
            'characterDyeColor',
            'characterGender',
            'characterBaseLevel',
            'characterJobLevel',
            'characterBaseExp',
            'characterJobExp',
            'characterBaseExpPercentage',
            'characterJobExpPercentage',
            'characterHp',
            'characterMp',
            'characterLocation',
            'characterZeny',
            'inventoryWeight',
            'characterAttributes',
            'huntStatus',
            'huntEndTimer',
            'characterEquipment',
            'puzzleChallenge',
            'characterCrafting',
            'craftTimer',
            'characterTraveling',
            'travelTimer',
            'characterResting',
            'restTimer',
        ]),

        currentHpPercentage() {
            let hp = Math.floor(this.characterHp / this.characterAttributes.maxHp * 100) || 0;

            if (hp < 0) {
                hp = 0;
            } else if (hp > 100) {
                hp = 100;
            }

            return hp;
        },
        currentMpPercentage() {
            let mp = Math.floor(this.characterMp / this.characterAttributes.maxMp * 100) || 0;

            if (mp < 0) {
                mp = 0;
            } else if (mp > 100) {
                mp = 100;
            }

            return mp;
        }
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
        inventoryWeight: {
            immediate: true,
            handler() {
                this.calculateWeightPercentage();
            }
        },
        huntStatus: {
            handler() {
                if (this.huntStatus === 'hunting') {
                    this.showTimer();
                } else if (this.huntStatus === 'retreating') {
                    this.resetTimer();
                }
            }
        },
        'characterAttributes.weight'() {
            this.calculateWeightPercentage();
        },
        characterCrafting: {
            immediate: true,
            handler() {
                if (this.characterCrafting) {
                    mo.socket.emit('getCraft');
                }
            }
        },
        craftTimer: {
            immediate: true,
            handler() {
                if (this.craftTimer) {
                    this.showNewTimer('crafting', this.craftTimer);
                } else if (!this.craftTimer && !this.characterCrafting) {
                    this.resetTimer();
                }
            }
        },
        characterTraveling: {
            immediate: true,
            handler() {
                if (this.characterTraveling) {
                    mo.socket.emit('getTravel');
                } else if (!this.travelTimer && !this.characterTraveling) {
                    this.resetTimer();
                }
            }
        },
        travelTimer: {
            immediate: true,
            handler() {
                if (this.travelTimer) {
                    this.showNewTimer('traveling', this.travelTimer);
                } else if (!this.travelTimer && !this.characterTraveling) {
                    this.resetTimer();
                }
            }
        },
        characterResting: {
            immediate: true,
            handler() {
                if (this.characterResting) {
                    mo.socket.emit('getRest');
                } else if (!this.restTimer && !this.characterResting) {
                    this.resetTimer();
                }
            }
        },
        restTimer: {
            immediate: true,
            handler() {
                if (this.restTimer) {
                    this.showNewTimer('resting', this.restTimer);
                } else if (!this.restTimer && !this.characterResting) {
                    this.resetTimer();
                }
            }
        }
    },
    mounted() {
        mo.socket.on('restingComplete', () => {
            this.$store.commit('restingComplete');
        });

        mo.socket.on('getRestComplete', (response) => {
            if (response.status) {
                this.$store.commit('restInProgress', response);
            }
        });

        mo.socket.on('getMapTravelChallengeComplete', (response) => {
            // Only react in case there is challenge provided
            if (response) {
                // Stop traveling, save new location
                this.$store.commit('puzzleChallenge', response);
            }
        });

        mo.socket.on('travelingComplete', (response) => {
            this.$store.commit('travelingComplete');

            // Stop traveling, save new location
            this.$store.commit('saveLocation', {
                location: response.locationName,
                locationId: response.locationId
            });
        });

        mo.socket.on('getTravelComplete', (response) => {
            // In case response is positive and challeenge is now enabled, we need to stop the timer
            if (response.status && response.challenge) {
                // Triggering map challenge
                mo.socket.emit('getMapTravelChallenge');

                // Reseting the timer
                this.resetTimer();
            } else if (response.status) {
                // In case it's just positive, timer need to be initiated
                this.$store.commit('travelInProgress', response);
            }
        });

        mo.socket.on('craftingComplete', () => {
            this.$store.commit('craftingComplete');
        });

        mo.socket.on('getCraftComplete', (response) => {
            if (response.status) {
                this.$store.commit('craftInProgress', response);
            }
        });

        mo.socket.on('initiateTradingComplete', (response) => {
            if (response) {
                this.$router.push('/trading');
            }

            this.buttonLoading = false;
        });

        mo.socket.on('tradeRequestReceived', (response) => {
            this.$store.commit('tradeRequest', response);
        });

        mo.socket.on('updateLocation', (response) => {
            // Stop traveling, save new location
            this.$store.commit('saveLocation', {
                location: response.location,
                locationId: response.locationId
            });
        });

        mo.socket.on('characterHp', (hp) => {
            this.$store.commit('setHpMp', {
                hp: hp
            });
        });

        mo.socket.on('characterMp', (mp) => {
            // Set mp to max
            this.$store.commit('setHpMp', {
                mp: mp
            });
        });

        mo.socket.on('stopHuntComplete', () => {
            this.resetTimer();

            this.$store.commit('huntStatus', {
                status: false,
                timeFinish: null
            });
        });

        mo.socket.on('interruptRestComplete', (response) => {
            if (response) {
                this.$store.commit('restingComplete');
            }
        });

        mo.socket.on('getCurrentMapLocationDataComplete', (location) => {
            // Saving current location in a state, so we can access it outside of game.vue
            this.$store.commit('currentLocation', location);
        });
    },
    beforeDestroy() {
        this.resetTimer();

        if (mo.socket) {
            mo.socket.off('getRestComplete');
            mo.socket.off('getMapTravelChallengeComplete');
            mo.socket.off('travelingComplete');
            mo.socket.off('craftingComplete');
            mo.socket.off('getCraftComplete');
            mo.socket.off('initiateTradingComplete');
            mo.socket.off('tradeRequestReceived');
            mo.socket.off('getCurrentMapLocationDataComplete');
            mo.socket.off('checkRestingTimeComplete');
            mo.socket.off('characterHp');
            mo.socket.off('characterMp');
            mo.socket.off('stopHuntComplete');
        }
    },
    methods: {
        resetTimer() {
            clearInterval(this.interval);
            this.huntingDisplay = '';
            this.timerDisplay = '';
        },
        calculateWeightPercentage() {
            this.weightPercentage = Math.floor((this.inventoryWeight * 100) / this.characterAttributes.weight);
        },
        showNewTimer(action, seconds) {
            this.timerAction = this.$t('charInfoTop.crafting');
            let socketEmitAction = 'getCraft';

            if (action === 'traveling') {
                this.timerAction = this.$t('charInfoTop.traveling');
                socketEmitAction = 'getTravel';
            } else if (action === 'resting') {
                this.timerAction = this.$t('charInfoTop.resting');
                socketEmitAction = 'getRest';
            }

            this.timerSeconds = seconds;

            this.interval = setInterval(() => {
                // If timer reached 0, switch user locations and unlock the map
                if (this.timerSeconds < 0) {
                    // Reset variable responsible for rest
                    this.resetTimer();

                    mo.socket.emit(socketEmitAction);

                    return true;
                }

                this.timerDisplay = this.timeConversion(this.timerSeconds);

                this.timerSeconds--;
            }, 1000);
        },
        showTimer() {
            // By default we show timer for travel
            const getter = 'huntEndTimer';
            const displayVariable = 'huntingDisplay';

            const dateTimeFinish = this.$store.getters.get(getter);

            this.interval = setInterval(() => {
                // Calculating remaining time every time from the date param
                const remainingTime = Math.floor((dateTimeFinish - new Date().getTime()) / 1000);

                // If timer reached 0, switch user locations and unlock the map
                if (remainingTime < 0) {
                    // Reset variable responsible for rest
                    this.resetTimer();

                    return true;
                }

                this[displayVariable] = this.timeConversion(remainingTime);
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
        }
    }
};
</script>