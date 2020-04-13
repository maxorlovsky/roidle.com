<template>
    <div v-if="!loading && allMaps"
        ref="map"
        class="map"
    >
        <div v-for="(piece, index) in allMaps"
            :key="index"
            class="map__row"
        >
            <div v-for="location in piece"
                :key="location.id"
                :class="{'map__piece--selected': location.id === characterLocationId, 'map__piece--traveling': location.id === travelingToLocation, 'map__piece--disabled': (travelingToLocation || restInProgress || huntStatus) && location.id !== travelingToLocation}"
                class="map__piece"
                @click="selectMap(location.id)"
            >
                <template v-if="location.id < 999">
                    <img :src="`/dist/assets/images/map/${location.mapFile}.png`">
                    <div class="map__piece__name">{{ location.name }}</div>
                    <div v-if="location.level"
                        :class="{'map__piece__levels--too-high': location.level[0] > characterBaseLevel, 'map__piece__levels--too-low': location.level[1] < characterBaseLevel }"
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

const mapPage = {
    data() {
        return {
            loading: true,
            showModal: false,
            humanReadableDate: '',
            travelDestinationName: '',
            travelDestinationId: 0,
            travelTime: 0
        };
    },
    computed: {
        ...mapGetters([
            'characterLocationId',
            'characterBaseLevel',
            'characterStats',
            'travelingToLocation',
            'restInProgress',
            'huntStatus',
            'allMaps'
        ])
    },
    watch: {
        allMaps: {
            immediate: true,
            handler() {
                this.loadMaps();
            }
        }
    },
    mounted() {
        mo.socket.on('getMapsComplete', (response) => {
            this.$store.commit('allMaps', response);
        });

        mo.socket.on('selectMapToTravelComplete', (response) => {
            this.humanReadableDate = response.humanReadableDate;
            this.travelDestinationName = response.travelDestinationName;

            this.showModal = true;
        });

        this.$store.commit('showChat', false);
    },
    beforeDestroy() {
        mo.socket.off('getMapsComplete');
        mo.socket.off('selectMapToTravelComplete');

        this.$store.commit('showChat', true);
    },
    methods: {
        loadMaps() {
            // In case all maps is set, remove loading and display map immediately
            if (this.allMaps) {
                this.loading = false;

                // There is some issue with scroll, that we need to wait for initial render to finish
                setTimeout(() => {
                    this.$refs.map.scrollLeft = document.querySelector('.map__piece--selected').offsetLeft - 102;
                    this.$refs.map.scrollTop = document.querySelector('.map__piece--selected').offsetTop - 102;
                }, 1);
            } else {
                // Otherwise, request maps from server
                mo.socket.emit('getMaps');
            }
        },
        confirmTravel() {
            mo.socket.emit('travelToMap', this.travelDestinationId);
            this.showModal = false;
        },
        selectMap(locationId) {
            // If it's a black square or user is on the same location, we don't do anything
            if (locationId >= 999 || locationId === this.characterLocationId || this.travelingToLocation || this.restInProgress || this.huntStatus) {
                return false;
            }

            // Storring travel location id for modal
            this.travelDestinationId = locationId;

            mo.socket.emit('selectMapToTravel', locationId);
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