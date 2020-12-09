<template>
    <div class="kafra-actions game__action">
        <div @click="openModal()">
            <img class="game__action__image"
                :src="`${serverUrl}/dist/assets/images/illust/kafra1.png`"
            >
            <span class="game__action__name">{{ $t('kafra.actionTitle') }}</span>
        </div>

        <div v-if="showKafraModal"
            class="modal"
        >
            <div class="modal__header">{{ $t('kafra.actionTitle') }}</div>
            <div class="modal__content kafra-actions__buttons">
                <button class="btn game-button"
                    @click="saveLocation()"
                >{{ $t('kafra.saveLocation') }}</button>
                <button :class="{'btn-disabled': characterSkills[1] < 6}"
                    class="btn game-button"
                    @click="openStorage()"
                >{{ $t('kafra.useStorage') }} ({{ storagePrice }} Z)</button>
                <button class="btn game-button"
                    @click="openBarberShop()"
                >{{ $t('kafra.barberService') }} ({{ barberPrice }} Z)</button>
                <button class="btn game-button"
                    @click="statResetStart()"
                >{{ $t('kafra.statsResetService') }} ({{ resetPrice }} Z)</button>
                <button class="btn game-button"
                    @click="skillsResetStart()"
                >{{ $t('kafra.skillsResetService') }} ({{ resetPrice }} Z)</button>
                <!--<button class="btn game-button"
                    @click="openGuildStorage()"
                >Use Guild storage (600 Z)</button>
                <button class="btn game-button"
                    @click="openTeleportService()"
                >Use Teleport Service</button>-->
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="showKafraModal = false"
                >{{ $t('global.cancel') }}</button>
            </div>
        </div>

        <div v-if="showResetStatsConfirmation"
            class="modal"
        >
            <div class="modal__header">{{ $t('kafra.resetStats') }}</div>
            <div class="modal__content kafra-actions__buttons">
                <template v-if="characterBaseLevel <= 80">
                    {{ $t('kafra.youWishToResetStats') }}<br>
                    {{ $t('kafra.resetCurrentPrice') }}: <b>{{ resetPrice }}</b><br>
                    {{ $t('kafra.resetZenyAvailable') }}: {{ characterZeny }}
                </template>
                <template v-else>{{ $t('kafra.resetBeyond') }}</template>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="showResetStatsConfirmation = false; showKafraModal = true"
                >{{ $t('global.cancel') }}</button>

                <button :disabled="characterZeny < resetPrice || characterBaseLevel > 80"
                    class="btn game-button"
                    @click="resetStats()"
                >{{ $t('kafra.resetReady') }}</button>
            </div>
        </div>

        <div v-if="showResetSkillsConfirmation"
            class="modal"
        >
            <div class="modal__header">{{ $t('kafra.resetSkills') }}</div>
            <div class="modal__content kafra-actions__buttons">
                <template v-if="characterBaseLevel <= 80">
                    {{ $t('kafra.youWishToResetSkills') }}<br>
                    {{ $t('kafra.resetCurrentPrice') }}: <b>{{ resetPrice }}</b><br>
                    {{ $t('kafra.resetZenyAvailable') }}: {{ characterZeny }}
                </template>
                <template v-else>{{ $t('kafra.resetBeyond') }}</template>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="showResetSkillsConfirmation = false; showKafraModal = true"
                >{{ $t('global.cancel') }}</button>

                <button :disabled="characterZeny < resetPrice || characterBaseLevel > 80"
                    class="btn game-button"
                    @click="resetSkills()"
                >{{ $t('kafra.resetReady') }}</button>
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
    name: 'kafra-actions',
    data() {
        return {
            showKafraModal: false,
            showResetStatsConfirmation: false,
            showResetSkillsConfirmation: false,
        };
    },
    computed: {
        ...mapGetters([
            'characterLocation',
            'characterZeny',
            'characterSkills',
            'characterBaseLevel',
            'serverUrl'
        ]),

        barberPrice() {
            return discount(1000, this.characterSkills[25]);
        },
        storagePrice() {
            return discount(60, this.characterSkills[25]);
        },
        resetPrice() {
            return discount(this.characterBaseLevel * 1000, this.characterSkills[25]);
        }
    },
    mounted() {
        mo.socket.on('characterResetStatsComplete', (response) => {
            this.$store.commit('resetStats', response);
            this.showKafraModal = false;
            this.showResetStatsConfirmation = false;
        });

        mo.socket.on('characterResetSkillsComplete', (response) => {
            this.$store.commit('setCharacterData', {
                attributes: response.attributes,
                skills: response.skills,
                skillPoints: response.skillPoints
            });
            this.$store.commit('setHpMp', {
                hp: response.attributes.maxHp,
                mp: response.attributes.maxMp
            });

            this.showKafraModal = false;
            this.showResetSkillsConfirmation = false;
        });
    },
    beforeDestroy() {
        mo.socket.off('characterResetStatsComplete');
        mo.socket.off('characterResetSkillsComplete');
    },
    methods: {
        openModal() {
            this.showKafraModal = true;
        },
        saveLocation() {
            mo.socket.emit('saveLocation');

            this.showKafraModal = false;
        },
        openBarberShop() {
            // If character don't have enough zeny, we dissallow him to use kafra storage service
            if (this.characterZeny < 1000) {
                this.$store.commit('sendChat', [
                    {
                        type: 'system',
                        character: 'System',
                        message: this.$t('kafra.insufficientZenyForBarber')
                    }
                ]);

                return false;
            }

            this.showKafraModal = false;

            this.$router.push('/barber-services');
        },
        openStorage() {
            // If character don't have enough zeny, we dissallow him to use kafra storage service
            if (this.characterZeny < 60) {
                this.$store.commit('sendChat', [
                    {
                        type: 'system',
                        character: 'System',
                        message: this.$t('kafra.insufficientZenyForStorage')
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
                        message: this.$t('kafra.needBasicLevel', {
                            level: 6
                        })
                    }
                ]);

                return false;
            }

            this.showKafraModal = false;

            this.$router.push('/kafra-storage');
        },
        statResetStart() {
            this.showKafraModal = false;
            this.showResetStatsConfirmation = true;
        },
        skillsResetStart() {
            this.showKafraModal = false;
            this.showResetSkillsConfirmation = true;
        },
        resetStats() {
            mo.socket.emit('characterResetStats');
        },
        resetSkills() {
            mo.socket.emit('characterResetSkills');
        }
    }
};
</script>