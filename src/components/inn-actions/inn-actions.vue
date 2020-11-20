<template>
    <div class="kafra-actions game__action">
        <div @click="openModal()">
            <img class="game__action__image"
                :src="`${serverUrl}/dist/assets/images/inn.png`"
            >
            <span class="game__action__name">Rest at Inn</span>
        </div>

        <div v-if="showModal"
            class="modal"
        >
            <div class="modal__header">Inn rooms</div>
            <div class="modal__content kafra-actions__buttons">
                <button :class="{'game-button--selected': typeChosen === 'cheap'}"
                    class="btn game-button"
                    @click="typeChosen = 'cheap'"
                >Cheap room - 10 min ({{ cheapInnPrice }} Z)</button>

                <button :class="{'game-button--selected': typeChosen === 'regular'}"
                    class="btn game-button"
                    @click="typeChosen = 'regular'"
                >Regular room - 5 min ({{ regularInnPrice }} Z)</button>

                <button :class="{'game-button--selected': typeChosen === 'deluxe'}"
                    class="btn game-button"
                    @click="typeChosen = 'deluxe'"
                >Deluxe room - 1 min ({{ deluxeInnPrice }} Z)</button>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="closeModal()"
                >Cancel</button>

                <button :disabled="!typeChosen"
                    :class="{'disabled': !typeChosen}"
                    class="btn game-button"
                    @click="startRest()"
                >Approve</button>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Utils
import discount from '@utils/discount.js';

export default {
    name: 'inn-actions',
    data() {
        return {
            typeChosen: '',
            showModal: false
        };
    },
    computed: {
        ...mapGetters([
            'characterSkills',
            'characterCrafting',
            'serverUrl'
        ]),

        cheapInnPrice() {
            return discount(1, this.characterSkills[25]);
        },
        regularInnPrice() {
            return discount(100, this.characterSkills[25]);
        },
        deluxeInnPrice() {
            return discount(1000, this.characterSkills[25]);
        },
    },
    mounted() {
        mo.socket.on('requestRestComplete', (response) => {
            this.$store.commit('saveResting', response.dateTimeFinish);
            this.$store.commit('saveZeny', response.zeny);
        });
    },
    beforeDestroy() {
        mo.socket.off('requestRest');
    },
    methods: {
        openModal() {
            if (this.characterCrafting) {
                return false;
            }

            this.showModal = true;
        },
        startRest() {
            mo.socket.emit('requestRest', this.typeChosen);

            this.closeModal();
        },
        closeModal() {
            this.typeChosen = '';
            this.showModal = false;
        }
    }
};
</script>