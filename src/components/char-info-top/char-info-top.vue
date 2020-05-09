<template>
    <div class="char-info">
        <div class="char-info-wrapper">
            <avatar :head-style="characterHeadStyle"
                :gender="characterGender"
                :job="characterJob"
                :just-head="true"
                :head-gear="characterEquipment.head.itemId"
            />

            <div class="char-info__description">
                <span class="char-info__description__name">{{ characterName }}</span>
                <span class="char-info__description__job">{{ characterJob }}</span>
            </div>

            <div class="char-info__health">
                <span class="char-info__health__hp"><span>HP:</span> {{ characterHp }} / {{ characterAttributes.maxHp }}</span>
                <span class="char-info__health__mp"><span>MP:</span> {{ characterMp }} / {{ characterAttributes.maxMp }}</span>
            </div>

            <div class="char-info__levels">
                <span class="char-info__levels__base">B.Lv: {{ characterBaseLevel }} ({{ characterBaseExpPercentage }}%)</span>
                <span class="char-info__levels__job">J.Lv: {{ characterJobLevel }} ({{ characterJobExpPercentage }}%)</span>
            </div>

            <div class="char-info__location">
                <span v-if="travelingDisplay"
                    class="char-info__location__place"
                >Traveling ({{ travelingDisplay }})</span>
                <span v-else-if="restingDisplay"
                    class="char-info__location__place"
                >Resting ({{ restingDisplay }})</span>
                <span v-else-if="huntingDisplay"
                    class="char-info__location__place"
                >Hunting ({{ huntingDisplay }})</span>
                <span v-else
                    class="char-info__location__place"
                >Location: {{ characterLocation }}</span>
                <span class="char-info__location__zeny">Zeny: {{ characterZeny }} | Weight: <span :class="{ 'char-info__overweight': weightPercentage > 90 }">{{ weightPercentage }}%</span></span>
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
            travelingDisplay: '',
            restingDisplay: '',
            huntingDisplay: '',
            interval: null,
            baseExpPercentage: '0.00',
            jobExpPercentage: '0.00',
            weightPercentage: 0
        };
    },
    computed: {
        ...mapGetters([
            'characterName',
            'characterJob',
            'characterHeadStyle',
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
            'travelingToLocation',
            'restInProgress',
            'inventoryWeight',
            'characterAttributes',
            'huntStatus',
            'huntEndTimer',
            'characterEquipment'
        ])
    },
    watch: {
        inventoryWeight: {
            immediate: true,
            handler() {
                this.calculateWeightPercentage();
            }
        },
        travelingToLocation: {
            immediate: true,
            handler() {
                if (this.travelingToLocation) {
                    this.showTimer('travel');
                }
            }
        },
        restInProgress: {
            immediate: true,
            handler() {
                if (this.restInProgress) {
                    this.showTimer('rest');
                }
            }
        },
        huntStatus: {
            handler() {
                if (this.huntStatus === 'hunting') {
                    this.showTimer('hunt');
                } else if (this.huntStatus === 'retreating') {
                    clearInterval(this.interval);
                    this.huntingDisplay = '';
                }
            }
        }
    },
    mounted() {
        mo.socket.on('checkTravelingTimeComplete', (response) => {
            // Stop traveling, save new location
            this.$store.commit('saveLocation', {
                location: response.locationName,
                locationId: response.locationId
            });
        });

        mo.socket.on('travelToMapComplete', (response) => {
            this.$store.commit('saveTraveling', {
                time: response.traveling.arrivalTime,
                locationId: response.traveling.travelingId,
                locationName: response.traveling.travelingName
            });
        });

        mo.socket.on('checkRestingTimeComplete', () => {
            // Set hp/mp to max
            this.$store.commit('setHpMp', {
                hp: this.characterAttributes.maxHp,
                mp: this.characterAttributes.maxMp
            });

            // Removing rest
            this.$store.commit('saveResting', false);
        });

        mo.socket.on('characterHp', (hp) => {
            // Set hp to max
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
            this.$store.commit('huntStatus', {
                status: false,
                timeFinish: null
            });
        });
    },
    beforeDestroy() {
        mo.socket.off('checkTravelingTimeComplete');
        mo.socket.off('travelToMapComplete');
        mo.socket.off('checkRestingTimeComplete');
        mo.socket.off('characterHp');
        mo.socket.off('stopHuntComplete');
    },
    methods: {
        calculateWeightPercentage() {
            this.weightPercentage = Math.floor((this.inventoryWeight * 100) / this.characterAttributes.weight);
        },
        showTimer(action) {
            // By default we show timer for travel
            let getter = 'travelingArrivalTime';
            let emitAction = 'checkTravelingTime';
            let displayVariable = 'travelingDisplay';

            if (action === 'rest') {
                getter = 'restInProgress';
                emitAction = 'checkRestingTime';
                displayVariable = 'restingDisplay';
            } else if (action === 'hunt') {
                getter = 'huntEndTimer';
                emitAction = '';
                displayVariable = 'huntingDisplay';
            }

            const dateTimeFinish = this.$store.getters.get(getter);

            this.interval = setInterval(() => {
                // Calculating remaining time every time from the date param
                const remainingTime = Math.floor((dateTimeFinish - new Date().getTime()) / 1000);

                // If timer reached 0, switch user locations and unlock the map
                if (remainingTime < 0) {
                    // Reseting traveling, just in case action will fail
                    if (emitAction === 'checkTravelingTime') {
                        this.$store.commit('saveTraveling', {
                            time: 0,
                            locationId: -1,
                            locationName: ''
                        });
                    }

                    // We add artificial delay to emit action later, as communication with server have a delay
                    setTimeout(() => {
                        mo.socket.emit(emitAction);
                    }, 1000);

                    // Reset variable responsible for rest
                    this[displayVariable] = '';
                    clearInterval(this.interval);

                    return true;
                }

                // Making display of resting time user friendly
                const minutes = Math.floor(remainingTime / 60);
                let seconds = remainingTime - minutes * 60;

                if (seconds <= 9) {
                    seconds = `0${seconds}`;
                }

                this[displayVariable] = `${minutes}:${seconds}`;
            }, 1000);
        }
    }
};
</script>