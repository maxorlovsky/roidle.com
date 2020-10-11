<template>
    <div class="kafra-actions game__action">
        <div @click="showModal = true">
            <img class="game__action__image"
                src="/dist/assets/images/craft.png"
            >
            <span class="game__action__name">Craft Services</span>
        </div>

        <div v-if="showModal"
            class="modal"
        >
            <div class="modal__header">Craft Services</div>
            <div class="modal__content kafra-actions__buttons">
                <button :disabled="characterCrafting"
                    class="btn game-button"
                    @click="$router.push('/repair')"
                >Blacksmith - Repair Items</button>

                <button :disabled="disableSmithy"
                    class="btn game-button"
                    @click="$router.push('/craft')"
                >Blacksmith - Craft item</button>

                <button :disabled="disableChemistry || characterCrafting"
                    class="btn game-button"
                    @click="$router.push('/craft')"
                >Alchemy - Craft item</button>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="closeModal()"
                >Cancel</button>
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
            showModal: false,
            disableSmithy: true,
            disableChemistry: true
        };
    },
    computed: {
        ...mapGetters([
            'characterSkills',
            'characterCrafting'
        ])
    },
    watch: {
        characterSkills: {
            immediate: true,
            handler() {
                if (this.characterSkills[29] >= 1 || this.characterSkills[30] >= 1) {
                    this.disableSmithy = false;
                } else {
                    this.disableSmithy = true;
                }
            }
        }
    },
    methods: {
        closeModal() {
            this.typeChosen = '';
            this.showModal = false;
        }
    }
};
</script>