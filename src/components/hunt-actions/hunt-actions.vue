<template>
    <div class="hunt-actions game__action">
        <div @click="openHunt()">
            <img class="game__action__image"
                :src="`${serverUrl}/dist/assets/images/sword.png`"
            >
            <span class="game__action__name">{{ $t('hunt.actionTitle') }}</span>
        </div>

        <div v-if="showHuntModal"
            class="modal"
        >
            <div class="modal__header">{{ $t('hunt.confirmHunt') }}</div>
            <div class="modal__content">
                <p>{{ $t('hunt.time') }}</p>
                <div class="hunt-time-buttons">
                    <button :class="{'selected': huntTime === 60}"
                        class="btn btn-light"
                        @click="huntTime = 60"
                    >1 {{ $t('hunt.min') }}</button>

                    <button :class="{'selected': huntTime === 300}"
                        class="btn btn-light"
                        @click="huntTime = 300"
                    >5 {{ $t('hunt.min') }}</button>

                    <button :class="{'selected': huntTime === 600}"
                        class="btn btn-light"
                        @click="huntTime = 600"
                    >10 {{ $t('hunt.min') }}</button>

                    <template v-if="enableLongerHunt">
                        <button :class="{'selected': huntTime === 1800}"
                            class="btn btn-light"
                            @click="huntTime = 1800"
                        >30 {{ $t('hunt.min') }}</button>
                        <button :class="{'selected': huntTime === 2700}"
                            class="btn btn-light"
                            @click="huntTime = 2700"
                        >45 {{ $t('hunt.min') }}</button>
                        <button :class="{'selected': huntTime === 3600}"
                            class="btn btn-light"
                            @click="huntTime = 3600"
                        >1 {{ $t('hunt.hour') }}</button>

                        <button :class="{'selected': huntTime === 7200}"
                            class="btn btn-light"
                            @click="huntTime = 7200"
                        >2 {{ $t('hunt.hours') }}</button>
                        <button :class="{'selected': huntTime === 14400}"
                            class="btn btn-light"
                            @click="huntTime = 14400"
                        >4 {{ $t('hunt.hours') }}</button>
                        <button :class="{'selected': huntTime === 21600}"
                            class="btn btn-light"
                            @click="huntTime = 21600"
                        >6 {{ $t('hunt.hours') }}</button>

                        <button :class="{'selected': huntTime === 28800}"
                            class="btn btn-light"
                            @click="huntTime = 28800"
                        >8 {{ $t('hunt.hours') }}</button>
                        <button :class="{'selected': huntTime === 36000}"
                            class="btn btn-light"
                            @click="huntTime = 36000"
                        >10 {{ $t('hunt.hours') }}</button>
                        <button :class="{'selected': huntTime === 43200}"
                            class="btn btn-light"
                            @click="huntTime = 43200"
                        >12 {{ $t('hunt.hours') }}</button>
                    </template>
                </div>

                <router-link to="/hunt-configuration"
                    class="hunt-actions__configuration"
                >
                    <button class="btn game-button">{{ $t('hunt.huntConfiguration') }}</button>
                </router-link>
            </div>
            <div class="modal__buttons">
                <button :disabled="buttonLoading"
                    class="btn btn-secondary"
                    @click="cancelHunt()"
                >{{ $t('global.cancel') }}</button>
                <button :disabled="!huntTime || buttonLoading"
                    :class="{'disabled': !huntTime}"
                    class="btn game-button"
                    @click="startHunt()"
                >{{ $t('hunt.start') }}</button>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Utilities
import { functions } from '@utils/functions.js';

export default {
    name: 'hunt-actions',
    data() {
        return {
            buttonLoading: false,
            showHuntModal: false,
            huntTime: null,
            enableLongerHunt: false
        };
    },
    computed: {
        ...mapGetters([
            'huntStatus',
            'characterId',
            'characterSkills',
            'serverUrl'
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

            this.buttonLoading = false;
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

            this.buttonLoading = true;
            this.showHuntModal = false;

            mo.socket.emit('startHunt', {
                time: this.huntTime
            });
        }
    }
};
</script>