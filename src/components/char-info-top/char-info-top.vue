<template>
    <div class="char-info">
        <avatar :head-style="characterHeadStyle"
            :gender="characterGender"
            :just-head="true"
        />

        <div class="char-info__description">
            <span class="char-info__description__name">{{ characterName }}</span>
            <span class="char-info__description__job">{{ jobTitle }}</span>
        </div>

        <div class="char-info__health">
            <span class="char-info__health__hp"><span>HP:</span> {{ characterHp }} / {{ maxHp }}</span>
            <span class="char-info__health__mp"><span>MP:</span> {{ characterMp }} / {{ maxMp }}</span>
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
            >Location: {{ location || '-' }}</span>
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
import jobs from '../../../config/jobs.json';

// Components
import avatar from '../avatar/avatar.vue';

// Utils
import locationUtils from '../../utils/location.js';
import itemsUtils from '../../utils/items.js';
import statsUtils from '../../utils/stats.js';

export default {
    name: 'char-info-top',
    components: {
        avatar
    },
    data() {
        return {
            jobTitle: '',
            maxHp: 0,
            maxMp: 0,
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
            'characterJobId',
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
            'inventory'
        ])
    },
    watch: {
        characterStatusPoints() {
            this.calculateStats();
        },
        inventory: {
            immediate: true,
            handler() {
                this.calculateWeight();
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
        restInProgress: {
            immediate: true,
            handler() {
                if (this.restInProgress) {
                    this.getRestingTime();
                }
            }
        },
        characterLocation() {
            this.getLocation();
        },
        characterBaseExp: {
            immediate: true,
            handler() {
                this.calculateExpPercentage();
            }
        },
        characterJobExp: {
            immediate: true,
            handler() {
                this.calculateExpPercentage();
            }
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.calculateStats();

            // Detect if traveling is in progress
            if (functions.storage('get', 'traveling')) {
                const traveling = functions.storage('get', 'traveling');

                traveling.time = Math.floor((traveling.dateTimeFinish - new Date().getTime()) / 1000);

                this.$store.commit('saveTraveling', traveling);
            } else {
                // Otherwise display current location of the user
                this.getLocation();
            }

            // Detect if resting is in progress
            if (functions.storage('get', 'resting')) {
                this.$store.commit('saveResting', true);
            }

            const foundJob = jobs.find((job) => job.id === this.characterJobId);

            this.jobTitle = foundJob.name;
        });
    },
    methods: {
        calculateWeight() {
            const currentWeight = itemsUtils.getCurrentWeight(this.inventory);
            const maxWeight = statsUtils.getWeightFormula(this.characterStats.str);

            this.weightPercentage = Math.round((currentWeight * 100) / maxWeight);
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
        switchLocations() {
            // Get traveling data from storage
            const traveling = functions.storage('get', 'traveling');

            this.$store.dispatch('updateLocation', traveling.locationId);

            // Reset variable responsible for travel
            this.travelingDisplay = '';
            clearInterval(this.interval);

            // Remove traveling data from storage
            functions.storage('remove', 'traveling');
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
            const traveling = functions.storage('get', 'traveling');

            this.interval = setInterval(() => {
                // Calculating remaining time every time from the date param
                const remainingTime = Math.floor((traveling.dateTimeFinish - new Date().getTime()) / 1000);

                // If timer reached 0, switch user locations and unlock the map
                if (remainingTime <= 0) {
                    this.switchLocations();

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
        },
        // Get current location of the character
        getLocation() {
            const locationItem = locationUtils.getLocation(Number(this.characterLocation));

            this.location = locationItem.name;
        },
        calculateStats() {
            this.maxHp = statsUtils.getHpFormula(this.characterJobId, this.characterBaseLevel, this.characterJobLevel, this.characterStats.vit);
            this.maxMp = statsUtils.getMpFormula(this.characterJobId, this.characterBaseLevel, this.characterJobLevel, this.characterStats.wis, this.characterStats.int);
        }
    }
};
</script>