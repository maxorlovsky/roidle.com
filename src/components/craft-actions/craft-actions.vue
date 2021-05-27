<template>
    <div class="kafra-actions game__action">
        <div @click="openModal()">
            <img class="game__action__image"
                :src="`${serverUrl}/dist/assets/images/craft.png`"
            >
            <span class="game__action__name">{{ $t('craft.actionTitle') }}</span>
        </div>

        <div v-if="showModal"
            class="modal"
        >
            <div class="modal__header">{{ $t('craft.actionTitle') }}</div>
            <div class="modal__content kafra-actions__buttons">
                <button :disabled="characterCrafting"
                    class="btn game-button"
                    @click="$router.push('/repair')"
                >{{ $t('craft.repairItems') }}</button>

                <button class="btn game-button"
                    @click="$router.push('/craft/smithy')"
                >{{ $t('craft.smithy') }}</button>

                <button class="btn game-button"
                    @click="$router.push('/craft/alchemy')"
                >{{ $t('craft.laboratory') }}</button>

                <button class="btn game-button"
                    disabled
                    @click="$router.push('/refinement')"
                >{{ $t('craft.grindingStation') }}</button>
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
    name: 'craft-actions',
    data() {
        return {
            showModal: false
        };
    },
    computed: {
        ...mapGetters([
            'characterCrafting',
            'serverUrl',
            'gameModal'
        ])
    },
    watch: {
        gameModal() {
            if (this.gameModal === 'craft') {
                return false;
            }

            this.showModal = false;
        }
    },
    methods: {
        openModal() {
            this.showModal = true;

            this.$store.commit('gameModal', 'craft');
        },
        closeModal() {
            this.typeChosen = '';
            this.showModal = false;
        }
    }
};
</script>