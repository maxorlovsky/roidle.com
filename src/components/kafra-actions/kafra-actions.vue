<template>
    <div class="kafra-actions game__action">
        <div @click="showKafraModal = true">
            <img src="/dist/assets/images/illust/kafra_01.bmp">
            <span class="game__action__name">Kafra Services</span>
        </div>

        <div v-if="showKafraModal"
            class="modal"
        >
            <div class="modal__header">Kafra Services</div>
            <div class="modal__content kafra-actions__buttons">
                <button class="btn btn-primary"
                    @click="saveLocation()"
                >Save Location</button>
                <button class="btn btn-primary"
                    @click="openStorage()"
                >Use Storage (60 Z)</button>
                <button class="btn btn-primary"
                    @click="openGuildStorage()"
                >Use Guild storage (600 Z)</button>
                <button class="btn btn-primary"
                    @click="openTeleportService()"
                >Use Teleport Service</button>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="showKafraModal = false"
                >Cancel</button>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

export default {
    name: 'kafra-actions',
    data() {
        return {
            showKafraModal: false
        };
    },
    computed: {
        ...mapGetters(['characterLocation'])
    },
    methods: {
        saveLocation() {
            if (!Number(this.characterLocation)) {
                console.error('[ERROR] Selected location is not found');

                return false;
            }

            this.$store.dispatch('updateSaveLocation', Number(this.characterLocation));

            this.showKafraModal = false;
        },
        openStorage() {
            //
        },
        openGuildStorage() {
            //
        },
        openTeleportService() {
            //
        }
    }
};
</script>