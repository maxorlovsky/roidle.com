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
                <button :class="{'btn-disabled': characterSkills[1] < 6}"
                    class="btn btn-primary"
                    @click="openStorage()"
                >Use Storage (60 Z)</button>
                <!--<button class="btn btn-primary"
                    @click="openGuildStorage()"
                >Use Guild storage (600 Z)</button>-->
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
        ...mapGetters(['characterLocation', 'characterZeny', 'characterSkills'])
    },
    methods: {
        saveLocation() {
            mo.socket.emit('saveLocation');

            this.showKafraModal = false;
        },
        openStorage() {
            // If character don't have enough zeny, we dissallow him to use kafra storage service
            if (this.characterZeny < 60) {
                this.$store.commit('sendChat', [
                    {
                        type: 'system',
                        character: 'System',
                        message: 'Insufficient Zeny to use Kafra Storage Service'
                    }
                ]);

                return false;
            }

            // If character basic skill level is less than 6 he is not allowed to use kafra service yet
            if (this.characterSkills[1] < 6) {
                this.$store.commit('sendChat', [
                    {
                        type: 'system',
                        character: 'System',
                        message: 'You need basic level 6 to start using Kafra Storage Services'
                    }
                ]);

                return false;
            }

            this.showKafraModal = false;

            this.$router.push('/kafra-storage');
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