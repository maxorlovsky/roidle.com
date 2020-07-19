<template>
    <div class="hunt-actions game__action">
        <div @click="openHunt()">
            <img class="game__action__image"
                src="/dist/assets/images/sword.png"
            >
            <span class="game__action__name">Hunt</span>
        </div>

        <div v-if="showHuntModal"
            class="modal"
        >
            <div class="modal__header">Confirm hunt</div>
            <div class="modal__content">
                <p>Time</p>
                <div class="hunt-time-buttons">
                    <button :class="{'selected': huntTime === 60}"
                        class="btn btn-light"
                        @click="huntTime = 60"
                    >1 min</button>

                    <button :class="{'selected': huntTime === 300}"
                        class="btn btn-light"
                        @click="huntTime = 300"
                    >5 min</button>

                    <button :class="{'selected': huntTime === 600}"
                        class="btn btn-light"
                        @click="huntTime = 600"
                    >10 min</button>

                    <template v-if="enableLongerHunt">
                        <button :class="{'selected': huntTime === 1800}"
                        class="btn btn-light"
                            @click="huntTime = 1800"
                        >30 min</button>
                        <button :class="{'selected': huntTime === 2700}"
                        class="btn btn-light"
                            @click="huntTime = 2700"
                        >45 min</button>
                        <button :class="{'selected': huntTime === 3600}"
                        class="btn btn-light"
                            @click="huntTime = 3600"
                        >1 hour</button>
                    </template>
                </div>

                <router-link to="/hunt-configuration"
                    class="hunt-actions__configuration"
                >
                    <button class="btn game-button">Hunt configuration<br>(active skills/healing)</button>
                </router-link>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="cancelHunt()"
                >Cancel</button>
                <button :disabled="!huntTime"
                    :class="{'disabled': !huntTime}"
                    class="btn game-button"
                    @click="startHunt()"
                >Start</button>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Globals functions
import { functions } from '@src/functions.js';

export default {
    name: 'hunt-actions',
    data() {
        return {
            showHuntModal: false,
            huntTime: null,
            enableLongerHunt: false
        };
    },
    computed: {
        ...mapGetters([
            'huntStatus',
            'characterId',
            'characterSkills'
        ])
    },
    watch: {
        characterSkills: {
            immediate: true,
            handler() {
                if (this.characterSkills[1] >= 8) {
                    this.enableLongerHunt = true;
                }
            }
        },
        huntTime() {
            functions.storage('set', `huntSelectedTime-${this.characterId}`, this.huntTime);
        }
    },
    mounted() {
        this.huntTime = functions.storage('get', `huntSelectedTime-${this.characterId}`) || 60;

        mo.socket.on('startHuntComplete', (response) => {
            // Marking character as in fight status
            // In case of retreat / retreating we don't retrigger the hunt
            if (response && response.status && this.huntStatus !== 'retreating') {
                this.$store.commit('huntStatus', {
                    status: 'hunting',
                    timeFinish: response.timeFinish
                });
            }
        });

        this.checkHuntState();
    },
    beforeDestroy() {
        mo.socket.off('startHuntComplete');
    },
    methods: {
        checkHuntState() {
            // If fight status is on, we need to display active hunt details
            mo.socket.emit('getHunt');
        },
        openHunt() {
            // Showing hunt modal
            this.showHuntModal = true;
        },
        cancelHunt() {
            // Reset all variables and dialogs
            this.showHuntModal = false;
        },
        startHunt() {
            // If fight in progress, we don't start another one
            if (this.huntStatus) {
                return false;
            }

            this.showHuntModal = false;

            mo.socket.emit('startHunt', {
                time: this.huntTime
            });
        }
    }
};
</script>