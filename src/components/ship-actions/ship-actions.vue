<template>
    <div class="ship-actions game__action">
        <div @click="showModal = true">
            <img class="game__action__image"
                :src="`${serverUrl}/dist/assets/images/ship.png`"
            >
            <span class="game__action__name">{{ $t('ship.actionTitle') }}</span>
        </div>

        <div v-if="showModal"
            class="modal"
        >
            <div class="modal__header">{{ $t('ship.actionTitle') }}</div>
            <div class="modal__content">
                <div v-if="userOverweight"
                    class="dungeon-actions__overweight"
                >
                    <p>{{ $t('ship.overweight') }}</p>
                </div>

                <button v-for="travelTo in travelOptions"
                    :key="travelTo.locationId"
                    :class="{'ship-actions__travel-buttons--selected': travelDestinationId === travelTo.locationId}"
                    class="btn game-button ship-actions__travel-buttons"
                    @click="travelDestinationId = travelTo.locationId"
                >{{ $t('map.travelTo') }} {{ travelTo.name }} ({{ travelTo.price }} Z) - {{ staticTimer(travelTo.timeToTravel) }}</button>
            </div>
            <div class="modal__buttons">
                <button :disabled="buttonLoading"
                    class="btn btn-secondary"
                    @click="closeModal()"
                >{{ $t('global.cancel') }}</button>
                <button :disabled="userOverweight || buttonLoading || !travelDestinationId"
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

// Mixins
import timerMixin from '@mixins/timers.js';

export default {
    name: 'ship-actions',
    mixins: [timerMixin],
    data() {
        return {
            buttonLoading: false,
            showModal: false,
            travelDestinationId: 0,
            userOverweight: false,
            travelOptions: []
        };
    },
    computed: {
        ...mapGetters([
            'characterAttributes',
            'inventoryWeight',
            'serverUrl'
        ])
    },
    watch: {
        inventoryWeight() {
            if (Math.floor((this.inventoryWeight * 100) / this.characterAttributes.weight) >= 100) {
                this.userOverweight = true;
            }
        }
    },
    mounted() {
        mo.socket.on('travelByShipComplete', (response) => {
            this.buttonLoading = false;

            // In case response is positive, we request to get travel of the user
            // In case there are some error it should appear in system chat
            if (response) {
                this.$store.commit('travelStart');

                this.closeModal();
            }
        });

        mo.socket.on('getTravelByShipPossibilitiesComplete', (response) => {
            if (response) {
                this.travelOptions = response;
            }
        });

        mo.socket.emit('getTravelByShipPossibilities');
    },
    beforeDestroy() {
        mo.socket.off('travelByShipComplete');
        mo.socket.off('getTravelByShipPossibilitiesComplete');
    },
    methods: {
        closeModal() {
            this.travelDestinationId = 0;
            this.showModal = false;
        },
        travel() {
            this.buttonLoading = true;

            mo.socket.emit('travelByShip', this.travelDestinationId);
        }
    }
};
</script>