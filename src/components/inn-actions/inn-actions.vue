<template>
    <div class="kafra-actions game__action">
        <div @click="openModal()">
            <img class="game__action__image"
                :src="`${serverUrl}/dist/assets/images/inn.png`"
            >
            <span class="game__action__name">{{ $t('rest.actionTitle') }}</span>
        </div>

        <div v-if="showModal"
            class="modal"
        >
            <div class="modal__header">{{ $t('rest.innRooms') }}</div>
            <div class="modal__content kafra-actions__buttons">
                <button :class="{'game-button--selected': typeChosen === 'cheap'}"
                    class="btn game-button"
                    @click="typeChosen = 'cheap'"
                >{{ $t('rest.cheapRoom') }} - 10 {{ $t('rest.min') }} ({{ cheapInnPrice }} Z)</button>

                <button :class="{'game-button--selected': typeChosen === 'regular'}"
                    class="btn game-button"
                    @click="typeChosen = 'regular'"
                >{{ $t('rest.regularRoom') }} - 5 {{ $t('rest.min') }} ({{ regularInnPrice }} Z)</button>

                <button :class="{'game-button--selected': typeChosen === 'deluxe'}"
                    class="btn game-button"
                    @click="typeChosen = 'deluxe'"
                >{{ $t('rest.cheapRoom') }} - 1 {{ $t('rest.min') }} ({{ deluxeInnPrice }} Z)</button>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="closeModal()"
                >{{ $t('global.cancel') }}</button>

                <button :disabled="!typeChosen"
                    :class="{'disabled': !typeChosen}"
                    class="btn game-button"
                    @click="startRest()"
                >{{ $t('rest.approve') }}</button>
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
            // In case response is positive, we request to get rest of the user
            // In case there are some error it should appear in system chat
            if (response) {
                this.$store.commit('restStart');
            }
        });
    },
    beforeDestroy() {
        mo.socket.off('requestRestComplete');
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