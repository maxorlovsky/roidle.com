<template>
    <div class="kafra-actions game__action">
        <div @click="showKafraModal = true">
            <img class="game__action__image"
                src="/dist/assets/images/illust/kafra1.png"
            >
            <span class="game__action__name">Kafra Services</span>
        </div>

        <div v-if="showKafraModal"
            class="modal"
        >
            <div class="modal__header">Kafra Services</div>
            <div class="modal__content kafra-actions__buttons">
                <button class="btn game-button"
                    @click="saveLocation()"
                >Save Location</button>
                <button :class="{'btn-disabled': characterSkills[1] < 6}"
                    class="btn game-button"
                    @click="openStorage()"
                >Use Storage ({{ storagePrice }} Z)</button>
                <button class="btn game-button"
                    @click="openBarberShop()"
                >Barber Shop Service ({{ barberPrice }} Z)</button>
                <button class="btn game-button"
                    @click="statResetStart()"
                >Stats Reset Service ({{ resetPrice }} Z)</button>
                <button class="btn game-button"
                    @click="skillsResetStart()"
                >Skills Reset Service ({{ resetPrice }} Z)</button>
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
                >Cancel</button>
            </div>
        </div>

        <div v-if="showResetStatsConfirmation"
            class="modal"
        >
            <div class="modal__header">Reset stats</div>
            <div class="modal__content kafra-actions__buttons">
                <template v-if="characterBaseLevel <= 80">
                    You wish to rebuild your body? It is possible, but it is very expensive alchemical potion and overall magical procedure. It will cost you a good amount of zeny. Your body normally can witstand it multiple time, but the more you grow the more expensive it will become. So you should rely on it too much.<br>
                    Current price: <b>{{ resetPrice }}</b><br>
                    Zeny available: {{ characterZeny }}
                </template>
                <template v-else>You have grown beyond our magic and alchemy to rebuild you the way you want. Sorry.</template>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="showResetStatsConfirmation = false; showKafraModal = true"
                >Cancel</button>

                <button :disabled="characterZeny < resetPrice || characterBaseLevel > 80"
                    class="btn game-button"
                    @click="resetStats()"
                >I'm ready, reset!</button>
            </div>
        </div>

        <div v-if="showResetSkillsConfirmation"
            class="modal"
        >
            <div class="modal__header">Reset skills</div>
            <div class="modal__content kafra-actions__buttons">
                <template v-if="characterBaseLevel <= 80">
                    You wish to rebuild your mental state? It is painful, ever heard about lobotomy? Well it's not that, but never the less, changing your mental state even by using magic is really hard. The more experience you gain, the more problems it will cause. Until the point of no return is reached.<br>
                    Current price: <b>{{ resetPrice }}</b><br>
                    Zeny available: {{ characterZeny }}
                </template>
                <template v-else>You have grown beyond our magic and alchemy to rebuild you the way you want. Sorry.</template>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="showResetSkillsConfirmation = false; showKafraModal = true"
                >Cancel</button>

                <button :disabled="characterZeny < resetPrice || characterBaseLevel > 80"
                    class="btn game-button"
                    @click="resetSkills()"
                >I'm ready, reset!</button>
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
            'characterBaseLevel'
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
                        message: 'Insufficient Zeny to use Barber Shop Service'
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