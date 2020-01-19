<template>
    <div class="kafra-actions game__action">
        <div @click="showInnModal = true">
            <img src="/dist/assets/images/inn.png">
            <span class="game__action__name">Rest at Inn</span>
        </div>

        <div v-if="showInnModal"
            class="modal"
        >
            <div class="modal__header">Inn rooms</div>
            <div class="modal__content kafra-actions__buttons">
                <button class="btn btn-primary"
                    @click="cheapRest()"
                >Cheap room - 10 min (1 Z)</button>

                <button class="btn btn-primary"
                    @click="regularRest()"
                >Regular room - 5 min (10 Z)</button>

                <button class="btn btn-primary"
                    @click="expensiveRest()"
                >Deluxe room - 1 min (100 Z)</button>

                <button class="btn btn-primary"
                    @click="premierRest()"
                >Premier room - 1 min + Buff (500 Z)</button>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="showInnModal = false"
                >Cancel</button>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Globals functions
import { functions } from '../../functions.js';

// Utils
import statsUtils from '../../utils/stats.js';

export default {
    name: 'inn-actions',
    data() {
        return {
            showInnModal: false
        };
    },
    computed: {
        ...mapGetters(['characterStats', 'restInProgress', 'characterZeny'])
    },
    methods: {
        getRestSpeed(restTime) {
            const speed = statsUtils.getSpeedFormula(this.characterStats.dex);

            return Math.floor(restTime - (restTime * (speed / 100)));
        },
        startRest(resting) {
            if (this.restInProgress) {
                return false;
            }

            // Check if user have enough zeny
            if (this.characterZeny <= resting.price) {
                this.$store.commit('sendChat', [
                    {
                        type: 'system',
                        character: 'System',
                        message: 'You don\'t have enough zeny to rent this room'
                    }
                ]);

                return false;
            }

            // Decrease zeny amount from character account
            this.$store.dispatch('updateZeny', this.characterZeny - resting.price);

            functions.storage('set', 'resting', resting, 604800000 * 90);

            // Put rest in progress
            this.$store.commit('saveResting', true);

            this.showInnModal = false;
        },
        cheapRest() {
            // Cheap rest takes by default 10m (600s)
            const restTime = this.getRestSpeed(10);

            const resting = {
                // Marking type, for end bonuses
                type: 1,
                price: 1,
                dateTimeFinish: new Date().getTime() + (restTime * 1000)
            };

            this.startRest(resting);
        },
        regularRest() {
            // Cheap rest takes by default 5m (300s)
            const restTime = this.getRestSpeed(300);

            const resting = {
                // Marking type, for end bonuses
                type: 2,
                price: 10,
                dateTimeFinish: new Date().getTime() + (restTime * 1000)
            };

            this.startRest(resting);
        },
        expensiveRest() {
            // Cheap rest takes by default 1m (60s)
            const restTime = this.getRestSpeed(60);

            const resting = {
                // Marking type, for end bonuses
                type: 3,
                price: 100,
                dateTimeFinish: new Date().getTime() + (restTime * 1000)
            };

            this.startRest(resting);
        },
        premierRest() {
            // Cheap rest takes by default 1m (60s) + buff
            const restTime = this.getRestSpeed(60);

            const resting = {
                // Marking type, for end bonuses
                type: 4,
                price: 500,
                dateTimeFinish: new Date().getTime() + (restTime * 1000)
            };

            this.startRest(resting);
        }
    }
};
</script>