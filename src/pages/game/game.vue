<template>
    <section :class="location"
        class="game"
    >
        <div class="party">
            <div class="party__slot">+</div>
            <div class="party__slot">+</div>
            <div class="party__slot">+</div>
            <div class="party__slot">+</div>

            <div class="party__name">Party: --</div>
        </div>

        <div class="game__actions">
            <div v-if="outsideActions"
                :class="{'game__action--disabled': fightStatus || travelingToLocation || restInProgress}"
                class="game__action"
                @click="showFightModal = true"
            >
                <img src="/dist/assets/images/sword.png">
                <span class="game__action__name">Hunt</span>
            </div>

            <!--<div v-if="outsideActions"
                :class="{'game__action--disabled': fightStatus || travelingToLocation || restInProgress}"
                class="game__action"
                @click="trackMonster()"
            >
                <img src="/dist/assets/images/eye.png">
                <span class="game__action__name">Track down</span>
            </div>-->

            <kafra-actions v-if="!outsideActions"
                :class="{'game__action--disabled': fightStatus || travelingToLocation || restInProgress}"
            />
            <inn-actions v-if="!outsideActions"
                :class="{'game__action--disabled': fightStatus || travelingToLocation || restInProgress}"
            />

            <div v-if="!outsideActions"
                :class="{'game__action--disabled': fightStatus || travelingToLocation || restInProgress}"
                class="game__action"
            >
                <img src="/dist/assets/images/shopping.png">
                <span class="game__action__name">Shop Dealers</span>
            </div>

            <div v-if="fightStatus"
                class="game__action-in-progress"
            >
                <div>Fight in progress</div>
                <div>{{ fightTimer }}</div>
                <button v-if="!cancelFight"
                    class="btn btn-secondary"
                    @click="stopHunt()"
                >Cancel hunt</button>
            </div>

            <div v-if="travelingToLocation || restInProgress"
                class="game__action-in-progress"
            >
                <div>{{ travelingToLocation ? 'Traveling' : 'Rest' }} in Progress</div>
            </div>
        </div>

        <div v-if="showFightModal"
            class="modal"
        >
            <div class="modal__header">Confirm hunt</div>
            <div class="modal__content">
                <p>Start the hunt</p>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="showFightModal = false"
                >Cancel</button>
                <button class="btn btn-primary"
                    @click="startHunt()"
                >GO</button>
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import kafraActions from '../../components/kafra-actions/kafra-actions.vue';
import innActions from '../../components/inn-actions/inn-actions.vue';

// Utils
import locationUtils from '../../utils/location.js';
import monstersUtils from '../../utils/monsters.js';
import statsUtils from '../../utils/stats.js';

const gamePage = {
    components: {
        kafraActions,
        innActions
    },
    data() {
        return {
            location: '',
            showFightModal: false,
            showKafraModal: false,
            selectedMonster: null,
            roundTime: 10000,
            fightTimer: 10,
            interval: null,
            outsideActions: false,
            monsterIds: [],
            cancelFight: false
        };
    },
    computed: {
        ...mapGetters([
            'characterName',
            'characterBaseLevel',
            'characterJobLevel',
            'characterBaseExp',
            'characterJobExp',
            'characterJobId',
            'characterStats',
            'characterLocation',
            'characterSaveLocation',
            'characterHp',
            'fightStatus',
            'travelingToLocation',
            'restInProgress'
        ])
    },
    watch: {
        characterLocation: {
            immediate: true,
            handler() {
                const locationItem = locationUtils.getLocation(Number(this.characterLocation));

                // Decide if we're outside of the city or in, this will change game actions
                if (locationItem.level) {
                    this.outsideActions = true;
                } else {
                    this.outsideActions = false;
                }

                if (locationItem.monsters) {
                    this.monsterIds = locationItem.monsters;
                } else {
                    this.monsterIds = [];
                }

                this.location = this.getLocationClass(locationItem.mapFile);
            }
        }
    },
    methods: {
        trackMonster() {
            this.$store.dispatch('updateExp', {
                baseExp: this.characterBaseExp + 5,
                jobExp: this.characterJobExp + 5
            });
        },
        stopHunt() {
            this.cancelFight = true;
        },
        startHunt() {
            // If fight in progress, we don't start another one
            // If there are no monster ids on the map, we have nothing to hunt for
            if (this.fightStatus && this.monsterIds) {
                return false;
            }

            this.showFightModal = false;
            this.$store.commit('fightStatus', true);

            const randomMonster = this.monsterIds[Math.floor(Math.random() * this.monsterIds.length)];

            this.selectedMonster = monstersUtils.getMonster(randomMonster);

            const charAttributes = {
                patk: statsUtils.getPatkFormula(this.characterJobId, this.characterBaseLevel, this.characterJobLevel, this.characterStats.str, this.characterStats.dex, this.characterStats.luk),
                matk: statsUtils.getMatkFormula(this.characterJobId, this.characterBaseLevel, this.characterJobLevel, this.characterStats.int, this.characterStats.dex, this.characterStats.luk),
                pdef: statsUtils.getPdefFormula(this.characterJobId, this.characterBaseLevel, this.characterJobLevel, this.characterStats.vit, this.characterStats.wis),
                mdef: statsUtils.getMdefFormula(this.characterJobId, this.characterBaseLevel, this.characterJobLevel, this.characterStats.wis, this.characterStats.vit),
                hit: statsUtils.getHitFormula(this.characterJobId, this.characterBaseLevel, this.characterJobLevel, this.characterStats.dex, this.characterStats.luk),
                eva: statsUtils.getEvaFormula(this.characterJobId, this.characterBaseLevel, this.characterJobLevel, this.characterStats.dex, this.characterStats.luk),
                speed: statsUtils.getSpeedFormula(this.characterStats.dex)
            };

            this.roundTime = Math.floor(this.roundTime - (this.roundTime * (charAttributes.speed / 100)));
            this.fightTimer = Math.ceil(this.roundTime / 1000);
            // 1 console.log(this.selectedMonster);
            // 1 console.log(charAttributes);

            this.interval = setInterval(() => {
                this.fightTimer--;
            }, 1000);

            setTimeout(() => {
                this.calculateRound(charAttributes);
            }, this.roundTime);
        },
        calculateRound(charAttributes) {
            let restartFight = false;

            this.fightTimer = Math.ceil(this.roundTime / 1000);

            // Fight calculate if char hit the mob
            let characterHitChance = Math.floor((charAttributes.hit * 200) / (charAttributes.hit + this.selectedMonster.eva));

            if (characterHitChance > 95) {
                characterHitChance = 95;
            } else if (characterHitChance < 5) {
                characterHitChance = 5;
            }

            let mobHitChance = Math.floor((this.selectedMonster.hit * 200) / (this.selectedMonster.hit + charAttributes.eva));

            if (mobHitChance > 95) {
                mobHitChance = 95;
            } else if (mobHitChance < 5) {
                mobHitChance = 5;
            }

            const charHit = characterHitChance >= Math.random() * 100;
            const mobHit = mobHitChance >= Math.random() * 100;
            const chat = [];

            if (charHit) {
                const damage = Math.floor(charAttributes.patk - (charAttributes.patk * (this.selectedMonster.pdef / 100))) +
                    Math.floor(charAttributes.matk - (charAttributes.matk * (this.selectedMonster.mdef / 100)));

                this.selectedMonster.currentHp -= damage;

                chat.push({
                    type: 'battle',
                    character: 'Battle',
                    message: `${this.characterName} dealt damage to ${this.selectedMonster.name} -${damage}`
                });
            } else {
                chat.push({
                    type: 'battle',
                    character: 'Battle',
                    message: `${this.characterName} missed ${this.selectedMonster.name}`
                });
            }

            if (mobHit) {
                const damage = Math.floor(this.selectedMonster.patk - (this.selectedMonster.patk * (charAttributes.pdef / 100))) +
                    Math.floor(this.selectedMonster.matk - (this.selectedMonster.matk * (charAttributes.mdef / 100)));

                // Updating char HP
                this.$store.dispatch('updateHpMp', {
                    hp: this.characterHp - damage > 0 ? this.characterHp - damage : 0
                });

                chat.push({
                    type: 'battle',
                    character: 'Battle',
                    message: `${this.selectedMonster.name} dealt damage to ${this.characterName} -${damage}`
                });
            } else {
                chat.push({
                    type: 'battle',
                    character: 'Battle',
                    message: `${this.selectedMonster.name} missed ${this.characterName}`
                });
            }

            if (this.characterHp <= 0) {
                // Character dead
                this.stopFight();
                this.charDeath();

                chat.push({
                    type: 'battle',
                    character: 'Battle',
                    message: `${this.characterName} was defeated`
                });

                // Do something with char death
            } else if (this.selectedMonster.currentHp <= 0) {
                // Mob dead
                this.stopFight();
                this.rewards();

                restartFight = true;

                chat.push({
                    type: 'battle',
                    character: 'Battle',
                    message: `${this.selectedMonster.name} was defeated, finishing blow was dealt by ${this.characterName}`
                });
            } else if (!this.cancelFight) {
                // Call same function again for recurse
                // Unless fight was canceled pre-emptively
                setTimeout(() => {
                    this.calculateRound(charAttributes);
                }, this.roundTime);
            }

            // Sending array of battle logs
            this.$store.commit('sendChat', chat);

            if (this.cancelFight) {
                this.stopFight();
            } else if (restartFight) {
                this.startHunt();
            }
        },
        rewards() {
            this.$store.dispatch('updateExp', {
                baseExp: this.characterBaseExp + this.selectedMonster.exp,
                jobExp: this.characterJobExp + this.selectedMonster.jexp
            });

            // Give out items
        },
        charDeath() {
            // Decrease exp by 5% in case of death
            const baseExpPenalty = this.characterBaseExp - Math.floor((this.characterBaseExp / 5));
            const jobExpPenalty = this.characterJobExp - Math.floor((this.characterJobExp / 5));

            // In case job penalty went into minus, we drop it to 0
            this.$store.dispatch('updateExp', {
                baseExp: baseExpPenalty < 0 ? 0 : baseExpPenalty,
                jobExp: jobExpPenalty < 0 ? 0 : jobExpPenalty
            });

            // Teleport character back to saveLocation
            this.$store.dispatch('updateLocation', this.characterSaveLocation);
        },
        stopFight() {
            // Stopping the fight
            this.$store.commit('fightStatus', false);
            // Reseting round time
            this.roundTime = 10000;
            // Reset cancel fight
            this.cancelFight = false;
            // Stopping timer
            clearInterval(this.interval);
        },
        getLocationClass(mapName) {
            let location = '';

            if (mapName.indexOf('fild') >= 0) {
                location = 'field';
            } else {
                location = 'prontera';
            }

            return location;
        }
    }
};

// Routing
mo.routes.push({
    path: '/game',
    component: gamePage
});

export default gamePage;
</script>