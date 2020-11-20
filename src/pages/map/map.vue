<template>
    <div v-if="!loading && allMaps"
        ref="map"
        class="map"
    >
        <div v-for="(piece, index) in allMaps"
            :key="index"
            class="map__row"
        >
            <div v-for="(location, subIndex) in piece"
                :key="subIndex"
                :class="{
                    'map__piece--selected': location.id === characterLocationId,
                    'map__piece--traveling': location.id === travelingToLocation,
                    'map__piece--disabled': (travelingToLocation || characterCrafting || restInProgress || huntStatus || userOverweight || currentLocation.dungeon) && location.id !== travelingToLocation
                }"
                class="map__piece"
                @click="selectMap(location.id)"
            >
                <template v-if="location.id < 999">
                    <img :src="`${serverUrl}/dist/assets/images/map/${location.mapFile}.png`">
                    <div class="map__piece__name">{{ location.name }}</div>
                    <div v-if="location.level"
                        :class="{'map__piece__levels--too-high': location.level[0] > characterBaseLevel, 'map__piece__levels--too-low': location.level[1] < characterBaseLevel - 5 }"
                        class="map__piece__levels"
                    >Lv: {{ location.level[0] }} - {{ location.level[1] }}</div>
                    <div v-else-if="location.city"
                        class="map__piece__levels"
                    >City</div>
                    <div class="map__piece__players">
                        <div v-for="player in ifPlayerDetected(location)"
                            :key="player.id"
                            class="map__piece__players__player"
                        >
                            <div class="map__piece__players__player__name">{{ player.name }}</div>
                            <avatar :head-style="player.headStyle"
                                :head-color="player.headColor"
                                :head-gears="player.headGears"
                                :gender="player.gender"
                                :just-head="true"
                            />
                        </div>
                    </div>
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
                <button class="btn game-button"
                    @click="confirmTravel()"
                >GO</button>
            </div>
        </div>

        <div v-if="userOverweight"
            class="modal"
        >
            <div class="modal__header">Overweight</div>
            <div class="modal__content">
                <p>Character is overweight, you can not travel to another location. Your character need to be below 90% of weight. Discard some items, use them or give it to someone else.</p>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import avatar from '@components/avatar/avatar.vue';

const mapPage = {
    components: {
        avatar
    },
    data() {
        return {
            loading: true,
            showModal: false,
            humanReadableDate: '',
            travelDestinationName: '',
            travelDestinationId: 0,
            travelTime: 0,
            userOverweight: false,
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
            'allMaps',
            'inventoryWeight',
            'characterAttributes',
            'partyMembers',
            'currentLocation',
            'characterCrafting',
            'serverUrl'
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

        this.$store.commit('enableChat', false);

        if (Math.floor((this.inventoryWeight * 100) / this.characterAttributes.weight) >= 90) {
            this.userOverweight = true;
        }
    },
    beforeDestroy() {
        mo.socket.off('getMapsComplete');
        mo.socket.off('selectMapToTravelComplete');

        this.$store.commit('enableChat', true);
    },
    methods: {
        ifPlayerDetected(location) {
            const foundMembers = [];

            for (const member of this.partyMembers) {
                if (member.locationId === location.id) {
                    foundMembers.push(member);
                }
            }

            return foundMembers;
        },
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
            if (locationId >= 999 || locationId === this.characterLocationId || this.travelingToLocation || this.characterCrafting || this.restInProgress || this.huntStatus || this.userOverweight || this.currentLocation.dungeon) {
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