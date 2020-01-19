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
            <div :class="{'game__action--disabled': fightStatus}"
                class="game__action"
                @click="showModal = true"
            >
                <img src="/dist/assets/images/sword.png">
                <span class="game__action__name">Hunt</span>
            </div>

            <div :class="{'game__action--disabled': fightStatus}"
                class="game__action"
                @click="trackMonster()"
            >
                <img src="/dist/assets/images/eye.png">
                <span class="game__action__name">Track down</span>
            </div>

            <div v-if="fightStatus"
                class="game__fight"
            >
                <div>fight in progress</div>
                <span>{{ fightTimer }}</span>
            </div>
        </div>

        <div v-if="showModal"
            class="game__modal"
        >
            <div class="map__modal__header">Confirm hunt</div>
            <div class="map__modal__content">
                <p>Start the hunt</p>
            </div>
            <div class="map__modal__buttons">
                <button class="btn btn-secondary"
                    @click="showModal = false"
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

// Utils
import locationUtils from '../../utils/location.js';
import monstersUtils from '../../utils/monsters.js';
import statsUtils from '../../utils/stats.js';

const gamePage = {
    data() {
        return {
            location: '',
            showModal: false,
            selectedMonster: null,
            roundTime: 10000,
            fightTimer: 10,
            interval: null
        };
    },
    computed: {
        ...mapGetters(['characterName', 'characterBaseLevel', 'characterJobLevel', 'characterBaseExp', 'characterJobExp', 'characterJobId', 'characterStats', 'characterLocation', 'characterHp', 'fightStatus'])
    },
    watch: {
        characterLocation: {
            immediate: true,
            handler() {
                const locationItem = locationUtils.getLocation(Number(this.characterLocation));

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
        startHunt() {
            // If fight in progress, we don't start another one
            if (this.fightStatus) {
                return false;
            }

            this.showModal = false;
            this.$store.commit('fightStatus', true);

            const monstersIds = [1002, 1007, 1063];
            const randomMonster = monstersIds[Math.floor(Math.random() * monstersIds.length)];

            this.selectedMonster = monstersUtils.getMonster(randomMonster);

            // 1 console.log(this.selectedMonster);

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
            // 1 console.log(charAttributes);

            this.interval = setInterval(() => {
                this.fightTimer--;
            }, 1000);

            setTimeout(() => {
                this.calculateRound(charAttributes);
            }, this.roundTime);
        },
        calculateRound(charAttributes) {
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

                this.$store.commit('saveCharHp', this.characterHp - damage);

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

                chat.push({
                    type: 'battle',
                    character: 'Battle',
                    message: `${this.selectedMonster.name} was defeated, finishing blow was dealt by ${this.characterName}`
                });
            } else {
                // Call same function again for recurse
                setTimeout(() => {
                    this.calculateRound(charAttributes);
                }, this.roundTime);
            }

            // Sending array of battle logs
            this.$store.commit('sendChat', chat);
        },
        rewards() {
            this.$store.commit('saveExp', {
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
            this.$store.commit('saveExp', {
                baseExp: baseExpPenalty < 0 ? 0 : baseExpPenalty,
                jobExp: jobExpPenalty < 0 ? 0 : jobExpPenalty
            });
        },
        stopFight() {
            // Stopping the fight
            this.$store.commit('fightStatus', false);
            // Reseting round time
            this.roundTime = 10000;
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