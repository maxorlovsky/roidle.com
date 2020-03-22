<template>
    <div class="char-info">
        <avatar :head-style="characterHeadStyle"
            :gender="characterGender"
            :just-head="true"
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
            <span class="char-info__levels__base">B.Lv: {{ characterBaseLevel }} ({{ baseExpPercentage }}%)</span>
            <span class="char-info__levels__job">J.Lv: {{ characterJobLevel }} ({{ jobExpPercentage }}%)</span>
        </div>

        <div class="char-info__location">
            <span v-if="travelingDisplay"
                class="char-info__location__place"
            >Traveling ({{ travelingDisplay }})</span>
            <span v-else-if="restingDisplay"
                class="char-info__location__place"
            >Resting ({{ restingDisplay }})</span>
            <span v-else
                class="char-info__location__place"
            >Location: {{ characterLocation }}</span>
            <span class="char-info__location__zeny">Zeny: {{ characterZeny }} | Weight: {{ weightPercentage }}%</span>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Globals functions
import { functions } from '../../functions.js';

// Configs
import exp from '../../../config/exp.json';

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
            'characterStats',
            'characterStatusPoints',
            'characterHp',
            'characterMp',
            'characterLocation',
            'characterZeny',
            'travelingToLocation',
            'restInProgress',
            'inventoryWeight',
            'characterAttributes'
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
                    this.getTravelingTime();
                }
            }
        },
        /* restInProgress: {
            immediate: true,
            handler() {
                if (this.restInProgress) {
                    this.getRestingTime();
                }
            }
        }, */
        // Calculate exp percentage
        characterBaseExp: {
            immediate: true,
            handler() {
                this.calculateExpPercentage();
            }
        },
        characterJobExp() {
            this.calculateExpPercentage();
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

        this.$nextTick(() => {
            // Detect if resting is in progress
            /* if (functions.storage('get', 'resting')) {
                this.$store.commit('saveResting', true);
            } */
        });
    },
    beforeDestroy() {
        mo.socket.off('checkTravelingTimeComplete');
        mo.socket.off('travelToMapComplete');
    },
    methods: {
        calculateWeightPercentage() {
            this.weightPercentage = Math.round((this.inventoryWeight * 100) / this.characterAttributes.weight);
        },
        calculateExpPercentage() {
            // Calculating base exp into percentage of how much user currently have
            let expTable = exp.exp.split(',');

            // Check if there is a next level, if yes show percentage, otherwise user reached max leve
            if (expTable[this.characterBaseLevel]) {
                this.baseExpPercentage = parseFloat(this.characterBaseExp * 100 / expTable[this.characterBaseLevel]).toFixed(2);
            } else {
                this.baseExpPercentage = '100';
            }

            // Calculating job exp into percentage of how much user currently have
            expTable = null;
            if (this.characterJobId === 0) {
                expTable = exp.noviceExp.split(',');
            } else if (this.characterJobId > 1 && this.characterJobId < 6) {
                expTable = exp.firstJobs.split(',');
            } else {
                expTable = exp.secondJobs.split(',');
            }

            // Check if there is a next level, if yes show percentage, otherwise user reached max leve
            if (expTable[this.characterJobLevel]) {
                this.jobExpPercentage = parseFloat(this.characterJobExp * 100 / expTable[this.characterJobLevel]).toFixed(2);
            } else {
                this.jobExpPercentage = '100';
            }
        },
        finishRest() {
            // Get resting data from storage
            const resting = functions.storage('get', 'resting');

            if (resting.type === 4) {
                // Add delux bonuses
            }

            this.$store.dispatch('updateHpMp', {
                hp: this.maxHp,
                mp: this.maxMp
            });

            // Reset variable responsible for travel
            this.restingDisplay = '';
            clearInterval(this.interval);

            // Put rest in progress
            this.$store.commit('saveResting', false);

            // Remove traveling data from storage
            functions.storage('remove', 'resting');
        },
        // Display traveling time
        getRestingTime() {
            const resting = functions.storage('get', 'resting');

            this.interval = setInterval(() => {
                // Calculating remaining time every time from the date param
                const remainingTime = Math.floor((resting.dateTimeFinish - new Date().getTime()) / 1000);

                // If timer reached 0, switch user locations and unlock the map
                if (remainingTime <= 0) {
                    this.finishRest();

                    return true;
                }

                // Making display of resting time user friendly
                const minutes = Math.floor(remainingTime / 60);
                let seconds = remainingTime - minutes * 60;

                if (seconds <= 9) {
                    seconds = `0${seconds}`;
                }

                this.restingDisplay = `${minutes}:${seconds}`;
            }, 1000);
        },
        // Display traveling time
        getTravelingTime() {
            const travelingArrivalTime = this.$store.getters.get('travelingArrivalTime');

            this.interval = setInterval(() => {
                // Calculating remaining time every time from the date param
                const remainingTime = Math.floor((travelingArrivalTime - new Date().getTime()) / 1000);

                // If timer reached 0, switch user locations and unlock the map
                if (remainingTime <= 0) {
                    mo.socket.emit('checkTravelingTime');
                    console.log('check traveling time');

                    // Reset variable responsible for travel
                    this.travelingDisplay = '';
                    clearInterval(this.interval);

                    return true;
                }

                // Making display of traveling time user friendly
                const minutes = Math.floor(remainingTime / 60);
                let seconds = remainingTime - minutes * 60;

                if (seconds <= 9) {
                    seconds = `0${seconds}`;
                }

                this.travelingDisplay = `${minutes}:${seconds}`;
            }, 1000);
        }
    }
};
</script>