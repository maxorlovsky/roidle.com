<template>
    <div class="dungeon-actions game__action">
        <div @click="showModal = true">
            <img class="game__action__image"
                :src="`${serverUrl}/dist/assets/images/dungeon-entrance.png`"
            >
            <span class="game__action__name">{{ $t('map.dungeonActionTitle') }}</span>
        </div>

        <div v-if="showModal"
            class="modal"
        >
            <div class="modal__header">{{ $t('map.dungeonActionTitle') }}</div>
            <div class="modal__content">
                <div v-if="userOverweight"
                    class="dungeon-actions__overweight"
                >
                    <p>{{ $t('map.overweight') }}</p>
                </div>

                {{ $t('map.travelTo') }} <b>{{ locationName }}</b>?
                <template v-if="!locationCity">{{ $t('global.shortLevel') }}: {{ locationLevels[0] }} - {{ locationLevels[1] }}</template>

                <div class="dungeon-actions__buttons">
                    <div v-if="currentLocation.dungeonUp"
                        :class="{'dungeon-actions__selected-button': directionSelected === 'up'}"
                        class="game-icon"
                        @click="switchDestination('up')"
                    >
                        <i class="icon icon-stairs-up" />
                    </div>

                    <div v-if="currentLocation.dungeonDown"
                        :class="{'dungeon-actions__selected-button': directionSelected === 'down'}"
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
                >{{ $t('global.cancel') }}</button>

                <button :disabled="userOverweight || buttonLoading"
                    class="btn game-button"
                    @click="travel()"
                >{{ $t('map.travel') }}</button>
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
            directionSelected: '',
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
        },
        inventoryWeight() {
            if (Math.floor((this.inventoryWeight * 100) / this.characterAttributes.weight) >= 90) {
                this.userOverweight = true;
            }
        }
    },
    mounted() {
        mo.socket.on('travelToDungeonComplete', (response) => {
            this.buttonLoading = false;

            // In case response is positive, we request to get travel of the user
            // In case there are some error it should appear in system chat
            if (response) {
                this.$store.commit('travelStart');

                this.closeModal();
            }
        });
    },
    beforeDestroy() {
        mo.socket.off('travelToDungeonComplete');
    },
    methods: {
        closeModal() {
            this.showModal = false;
        },
        travel() {
            this.buttonLoading = true;

            mo.socket.emit('travelToDungeon', {
                locationId: this.travelDestinationId,
                direction: this.directionSelected
            });
        },
        switchDestination(destination) {
            let destinationObject = '';

            if (destination === 'down') {
                destinationObject = 'dungeonDownInfo';
                this.directionSelected = 'down';
            } else if (destination === 'up') {
                destinationObject = 'dungeonUpInfo';
                this.directionSelected = 'up';
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