<template>
    <div class="dungeon-actions game__action">
        <div @click="showModal = true">
            <img class="game__action__image"
                :src="`${serverUrl}/dist/assets/images/dungeon-entrance.png`"
            >
            <span class="game__action__name">Dungeon</span>
        </div>

        <div v-if="showModal"
            class="modal"
        >
            <div class="modal__header">Dungeon</div>
            <div class="modal__content">
                <div v-if="userOverweight"
                    class="dungeon-actions__overweight"
                >
                    <p>Character is overweight, you can not travel to another location. Your character need to be below 90% of weight. Discard some items, use them or give it to someone else.</p>
                </div>

                Travel to <b>{{ locationName }}</b>?
                <template v-if="!locationCity">Lv: {{ locationLevels[0] }} - {{ locationLevels[1] }}</template>

                <div class="dungeon-actions__buttons">
                    <div v-if="currentLocation.dungeonUp"
                        :class="{'dungeon-actions__selected-button': destinationSelected === 'up'}"
                        class="game-icon"
                        @click="switchDestination('up')"
                    >
                        <i class="icon icon-stairs-up" />
                    </div>

                    <div v-if="currentLocation.dungeonDown"
                        :class="{'dungeon-actions__selected-button': destinationSelected === 'down'}"
                        class="game-icon"
                        @click="switchDestination('down')"
                    >
                        <i class="icon icon-stairs-down" />
                    </div>
                </div>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="closeModal()"
                >Cancel</button>

                <button :disabled="userOverweight || buttonLoading"
                    class="btn game-button"
                    @click="travel()"
                >Travel</button>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

export default {
    name: 'dungeon-actions',
    data() {
        return {
            buttonLoading: false,
            showModal: false,
            travelDestinationId: 0,
            destinationSelected: '',
            locationName: '',
            locationLevels: [1, 1],
            locationCity: false,
            userOverweight: false
        };
    },
    computed: {
        ...mapGetters([
            'currentLocation',
            'characterAttributes',
            'inventoryWeight',
            'serverUrl'
        ])
    },
    watch: {
        currentLocation: {
            immediate: true,
            handler() {
                // In case only one dungeon position available, we pre-select it automatically
                if (this.currentLocation.dungeonDown) {
                    this.switchDestination('down');
                } else if (this.currentLocation.dungeonUp) {
                    this.switchDestination('up');
                }
            }
        }
    },
    mounted() {
        mo.socket.on('travelToDungeonComplete', (response) => {
            this.buttonLoading = false;

            if (response) {
                this.$store.commit('saveTraveling', {
                    time: response.traveling.arrivalTime,
                    locationId: response.traveling.travelingId,
                    locationName: response.traveling.travelingName
                });

                this.closeModal();
            }
        });
        if (Math.floor((this.inventoryWeight * 100) / this.characterAttributes.weight) >= 90) {
            this.userOverweight = true;
        }
    },
    methods: {
        closeModal() {
            this.showModal = false;
        },
        travel() {
            this.buttonLoading = true;

            mo.socket.emit('travelToDungeon', {
                locationId: this.travelDestinationId,
                destination: this.destinationSelected
            });
        },
        switchDestination(destination) {
            let destinationObject = '';

            if (destination === 'down') {
                destinationObject = 'dungeonDownInfo';
                this.destinationSelected = 'down';
            } else if (destination === 'up') {
                destinationObject = 'dungeonUpInfo';
                this.destinationSelected = 'up';
            }

            this.locationName = this.currentLocation[destinationObject].name;
            this.travelDestinationId = this.currentLocation[destinationObject].id;

            if (this.currentLocation[destinationObject].city) {
                this.locationCity = this.currentLocation[destinationObject].city;
            } else {
                this.locationCity = false;
            }

            if (this.currentLocation[destinationObject].level) {
                this.locationLevels = this.currentLocation[destinationObject].level;
            } else {
                this.locationLevels = [];
            }
        }
    }
};
</script>