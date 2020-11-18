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

                <button :disabled="disableCraft"
                    class="btn game-button"
                    @click="$router.push('/craft')"
                >Craft items</button>
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
            disableCraft: true
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
                if (this.characterSkills[29] >= 1 || this.characterSkills[30] >= 1 || this.characterSkills[36] >= 1) {
                    this.disableCraft = false;
                } else {
                    this.disableCraft = true;
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