<template>
    <div class="town-hall-actions game__action">
        <div @click="openModal()">
            <img class="game__action__image"
                :src="`${serverUrl}/dist/assets/images/townhall.png`"
            >
            <span class="game__action__name">{{ $t('townHall.title') }}</span>
        </div>

        <div v-if="showModal"
            class="modal"
        >
            <div class="modal__header">{{ $t('townHall.title') }}</div>
            <div class="modal__content">
                <button class="btn game-button ship-actions__travel-buttons"
                    @click="$router.push('/town-hall')"
                >Enter Town Hall</button>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="closeModal()"
                >{{ $t('global.cancel') }}</button>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

export default {
    name: 'town-hall-actions',
    data() {
        return {
            showModal: false
        };
    },
    computed: {
        ...mapGetters([
            'serverUrl',
            'gameModal',
        ]),
    },
    watch: {
        gameModal() {
            if (this.gameModal === 'town-hall') {
                return false;
            }

            this.closeModal();
        }
    },
    methods: {
        openModal() {
            this.showModal = true;
            this.$store.commit('gameModal', 'town-hall');
        },
        closeModal() {
            this.showModal = false;
        }
    }
};
</script>