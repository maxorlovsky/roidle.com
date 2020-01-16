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
            <span class="char-info__health__hp"><span>HP:</span> 1 / {{ maxHp }}</span>
            <span class="char-info__health__mp"><span>MP:</span> 1 / {{ maxMp }}</span>
        </div>

        <div class="char-info__levels">
            <span class="char-info__levels__base">B.Lv: {{ characterBaseLevel }} (0.00%)</span>
            <span class="char-info__levels__job">J.Lv: {{ characterJobLevel }} (0.00%)</span>
        </div>

        <div class="char-info__location">
            <span v-if="travelingDisplay"
                class="char-info__location__place"
            >Traveling ({{ travelingDisplay }})</span>
            <span v-else
                class="char-info__location__place"
            >Location: {{ location || '-' }}</span>
            <span class="char-info__location__party">Party: --</span>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Globals functions
import { functions } from '../../functions.js';

// Configs
import allMaps from '../../../config/map.json';
import jobs from '../../../config/jobs.json';

// Components
import avatar from '../avatar/avatar.vue';

// Utils
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
            interval: null
        };
    },
    computed: {
        ...mapGetters(['characterName', 'characterJobId', 'characterHeadStyle', 'characterGender', 'characterBaseLevel', 'characterJobLevel', 'characterStats', 'characterStatusPoints', 'characterLocation', 'travelingToLocation'])
    },
    watch: {
        characterStatusPoints() {
            this.calculateStats();
        },
        travelingToLocation: {
            immediate: true,
            handler() {
                if (this.travelingToLocation) {
                    this.getTravelingTime();
                }
            }
        },
        characterLocation() {
            this.getLocation();
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

            const foundJob = jobs.find((job) => job.id === this.characterJobId);

            this.jobTitle = foundJob.name;
        });
    },
    methods: {
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

                if (seconds < 9) {
                    seconds = `0${seconds}`;
                }

                this.travelingDisplay = `${minutes}:${seconds}`;
            }, 1000);
        },
        // Get current location of the character
        getLocation() {
            let mapPiece = null;

            for (const row of Object.keys(allMaps)) {
                mapPiece = allMaps[row].find((piece) => piece.id === Number(this.characterLocation));

                if (mapPiece) {
                    break;
                }
            }

            this.location = mapPiece.name;
        },
        calculateStats() {
            this.maxHp = statsUtils.getHpFormula(this.characterJobId, this.characterBaseLevel, this.characterJobLevel, this.characterStats.vit);
            this.maxMp = statsUtils.getMpFormula(this.characterJobId, this.characterBaseLevel, this.characterJobLevel, this.characterStats.wis, this.characterStats.int);
        }
    }
};
</script>