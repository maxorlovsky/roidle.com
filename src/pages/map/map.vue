<template>
    <div ref="map"
        class="map"
    >
        <div v-for="(piece, index) in map"
            :key="index"
            class="map__row"
        >
            <div v-for="location in piece"
                :key="location.id"
                :class="{'map__piece--selected': location.id === characterLocation, 'map__piece--traveling': location.id === travelingToLocation, 'map__piece--disabled': (travelingToLocation || restInProgress) && location.id !== travelingToLocation}"
                class="map__piece"
                @click="selectMap(location.id)"
            >
                <template v-if="location.id < 999">
                    <img :src="`/dist/assets/images/map/${location.mapFile}.gif`">
                    <div class="map__piece__name">{{ location.name }}</div>
                    <div v-if="location.level"
                        :class="{'map__piece__levels--too-high': location.level[0] > characterBaseLevel, 'map__piece__levels--too-low': location.level[1] < 5 }"
                        class="map__piece__levels"
                    >Lv: {{ location.level[0] }} - {{ location.level[1] }}</div>
                    <div v-else
                        class="map__piece__levels"
                    >City</div>
                </template>
            </div>
        </div>

        <div v-if="showModal"
            class="modal"
        >
            <div class="modal__header">Confirm travel</div>
            <div class="modal__content">
                <p>Traveling to <b>{{ travelDestinationName }}</b></p>
                <span>Travel will take you {{ humanReadableDate }}~</span>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="showModal = false"
                >Cancel</button>
                <button class="btn btn-primary"
                    @click="confirmTravel()"
                >GO</button>
            </div>
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

// Utils
import statsUtils from '../../utils/stats.js';

const mapPage = {
    data() {
        return {
            map: allMaps,
            showModal: false,
            humanReadableDate: '',
            travelDestination: {},
            travelTime: 0
        };
    },
    computed: {
        ...mapGetters(['characterLocation', 'characterBaseLevel', 'characterStats', 'travelingToLocation', 'restInProgress'])
    },
    mounted() {
        this.$nextTick(() => {
            this.$refs.map.scrollLeft = document.querySelector('.map__piece--selected').offsetLeft - 102;

            // There is some issue with scroll to top, that we need to wait for initial render to finish
            setTimeout(() => {
                this.$refs.map.scrollTop = document.querySelector('.map__piece--selected').offsetTop - 102;
            }, 1);
        });
    },
    methods: {
        confirmTravel() {
            const traveling = {
                time: this.travelTime,
                dateTimeFinish: new Date().getTime() + (this.travelTime * 1000),
                locationId: this.travelDestination.id,
                locationName: this.travelDestination.name
            };

            functions.storage('set', 'traveling', traveling, 604800000 * 90);

            this.$store.commit('saveTraveling', traveling);

            this.showModal = false;
        },
        selectMap(locationId) {
            // If it's a black square, we don't do anything
            if (locationId >= 999 || locationId === this.characterLocation || this.travelingToLocation || this.restInProgress) {
                return false;
            }

            // Reset values
            this.travelDestination = null;
            this.humanReadableDate = '';
            this.travelTime = 0;

            let currentMapPiece = null;

            // Mapping through maps and getting info on current position and destination position
            for (const row of Object.keys(this.map)) {
                if (!this.travelDestination) {
                    this.travelDestination = this.map[row].find((piece) => piece.id === Number(locationId));
                }

                if (!currentMapPiece) {
                    currentMapPiece = this.map[row].find((piece) => piece.id === Number(this.characterLocation));
                }
            }

            // Calculating positive numbers for steps
            const x = currentMapPiece.coordiates[0] > this.travelDestination.coordiates[0] ? currentMapPiece.coordiates[0] - this.travelDestination.coordiates[0] : this.travelDestination.coordiates[0] - currentMapPiece.coordiates[0];
            const y = currentMapPiece.coordiates[1] > this.travelDestination.coordiates[1] ? currentMapPiece.coordiates[1] - this.travelDestination.coordiates[1] : this.travelDestination.coordiates[1] - currentMapPiece.coordiates[1];

            // Calculating speed of a character for reduction
            const speed = statsUtils.getSpeedFormula(this.characterStats.dex);

            // Getting how many steps we need to do in order to move to destination location
            // Multiply by 5 minutes each
            const fullTime = (x + y) * 300;

            // Deducting speed of a character
            this.travelTime = Math.floor(fullTime - (fullTime * (speed / 100)));

            const minutes = Math.floor(this.travelTime / 60);
            const seconds = this.travelTime - minutes * 60;

            this.humanReadableDate = `${minutes}m ${seconds}s`;
            this.travelDestinationName = this.travelDestination.name;

            this.showModal = true;
        }
    }
};

// Routing
mo.routes.push({
    path: '/map',
    component: mapPage
});

export default mapPage;
</script>