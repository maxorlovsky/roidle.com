<template>
    <div class="stats">
        <div v-for="stat in statsNames"
            :key="stat"
            class="stats__stat"
        >
            <div class="stats__icon game-icon"
                @click="showStatInfo(stat)"
            >
                <img :src="`/dist/assets/images/${stat}.png`">
            </div>
            <span class="stats__label"
                @click="showStatInfo(stat)"
            >{{ stat }}:</span>
            <div class="stats__numbers">
                <span class="stats__numbers__base">{{ stats[stat] }}</span>
                <span class="stats__numbers__bonus">+{{ bonusStats[stat] }}</span>
                <span class="stats__numbers__cost">
                    <span :class="{'stats__numbers__arrow--disabled': tempStatusPoints < statCost[stat]}"
                        class="stats__numbers__arrow"
                    >></span> {{ statCost[stat] }}
                </span>
            </div>
            <div :class="{'stats__incdec--disabled': stats[stat] === 1 || stats[stat] === characterStats[stat]}"
                class="stats__incdec"
                @click="decreaseTempStat(stat)"
            >-</div>
            <div :class="{'stats__incdec--disabled': stats[stat] === 99 || tempStatusPoints < statCost[stat]}"
                class="stats__incdec"
                @click="increaseTempStat(stat)"
            >+</div>
        </div>

        <div class="stats__bottom">
            <div class="stats__points">
                <span class="stats__points__label">Status points:</span>
                <span :class="{'stats__points__points--empty': tempStatusPoints === 0 }"
                    class="stats__points__points"
                >{{ tempStatusPoints }}</span>
            </div>

            <button :disabled="tempStatusPoints === characterStatusPoints"
                class="btn game-button stats__apply"
                @click="saveStats()"
            >Save</button>
        </div>

        <attributes :patk="attributes.patk"
            :matk="attributes.matk"
            :pdef="attributes.pdef"
            :mdef="attributes.mdef"
            :hit="attributes.hit"
            :eva="attributes.eva"
            :speed="attributes.speed"
            :crit="attributes.crit"
            :crit-def="attributes.critDef"
            :max-hp="attributes.maxHp"
            :max-mp="attributes.maxMp"
            :party-name="partyName"
            :job="characterJob"
            :base-level="characterBaseLevel"
            :job-level="characterJobLevel"
        />

        <div v-if="statExplanation.show"
            class="modal"
            @click="statExplanation.show = false"
            v-html="statExplanation.statInfo"
        />
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import attributes from '@components/attributes/attributes.vue';

export default {
    name: 'stats',
    components: {
        attributes
    },
    data() {
        return {
            statsNames: ['str', 'dex', 'int', 'vit', 'wis', 'luk'],
            stats: {
                str: 0,
                dex: 0,
                int: 0,
                vit: 0,
                wis: 0,
                luk: 0
            },
            bonusStats: {
                str: 0,
                dex: 0,
                int: 0,
                vit: 0,
                wis: 0,
                luk: 0
            },
            statCost: {
                str: 2,
                dex: 2,
                int: 2,
                vit: 2,
                wis: 2,
                luk: 2
            },
            attributes: {
                patk: 0,
                matk: 0,
                pdef: 0,
                mdef: 0,
                hit: 0,
                eva: 0,
                speed: 0,
                crit: 0,
                critDef: 0,
                maxHp: 0,
                maxMp: 0
            },
            tempStatusPoints: 0,
            statExplanation: {
                show: false,
                statInfo: ''
            }
        };
    },
    computed: {
        ...mapGetters([
            'characterEquipment',
            'characterStats',
            'characterBonusStats',
            'characterAttributes',
            'characterStatusPoints',
            'characterBaseLevel',
            'characterJobLevel',
            'characterJobId',
            'characterJob',
            'partyName'
        ])
    },
    watch: {
        characterStats: {
            immediate: true,
            handler() {
                this.updateTempStats();
            }
        }
    },
    mounted() {
        // On hypo request, we update user attributes, this object is not really used for anything beside display, so it's safe to manipulate
        mo.socket.on('getCharacterHypotheticalAttributesComplete', (response) => {
            this.bonusStats = response.bonusStats;
            this.attributes = response.attributes;
        });

        // After successful saving of stats sending request to update character stats globally
        mo.socket.on('saveCharacterStatsComplete', (response) => {
            // In case we receive success response, we trigger the renew of the stats in the vuex as it's already updated on a backend
            if (response) {
                this.renewStats();
            } else {
                this.$store.commit('sendChat', [
                    {
                        type: 'system',
                        character: 'System',
                        message: 'Something went wrong while trying to update your stats'
                    }
                ]);
            }
        });
    },
    beforeDestroy() {
        mo.socket.off('getCharacterHypotheticalAttributesComplete');
        mo.socket.off('saveCharacterStatsComplete');
    },
    methods: {
        showStatInfo(stat) {
            this.statExplanation.show = true;

            if (stat === 'str') {
                this.statExplanation.statInfo = '<b>Strength (STR)</b>: This stat affects the physical power (P.Atk) of the character, be that of melee or range, melee benefit more from Strength than range.<br>Primary stat for jobs: <b>Fighter, Thief</b><br>Secondary stat for jobs: <b>Merchant</b>';
            } else if (stat === 'dex') {
                this.statExplanation.statInfo = '<b>Dexterity (DEX)</b>: This stat affect character HIT(Accuracy) and EVA(Evade) parameters. This stat affects the speed of how fast character can finish missions and travel. Speed affects whole party. This stat affect physical power of the character by a little. Range weapons benefit more from this stat.<br>Primary stat for jobs: <b>Archer, Thief</b>';
            } else if (stat === 'int') {
                this.statExplanation.statInfo = '<b>Intellect (INT)</b>: This stat affects the mental power (M.Atk) of the character, allowing to deal massive magic damage<br>Primary stat for jobs: <b>Mage</b>';
            } else if (stat === 'vit') {
                this.statExplanation.statInfo = '<b>Vitality (VIT)</b>: This stat affects the physical defense (P.Def) and HP and is a mandatory stat for protectors<br>Secondary stat for jobs: <b>Fighter</b>';
            } else if (stat === 'wis') {
                this.statExplanation.statInfo = '<b>Wisdom (WIS)</b>: This stat affects the healing capabilities of acolyte, magical defense (M.Def) and MP<br>Primary stat for jobs: <b>Acolyte</b><br>Secondary stat for jobs: <b>Mage</b>';
            } else if (stat === 'luk') {
                this.statExplanation.statInfo = '<b>Luck (LUK)</b>: This stat affects the luck of a character and every other stat and attribute in many ways, primarily it is used for crafts, crit chance defense and crit chance attack<br>Primary stat for jobs: <b>Merchant</b><br>Secondary stat for jobs: <b>Thief, Archer</b>';
            }
        },
        renewStats() {
            // Renew stats after the save, to represent what we have on backend
            this.$store.commit('setCharacterData', {
                stats: this.stats,
                bonusStats: this.bonusStats,
                attributes: this.attributes,
                statusPoints: this.tempStatusPoints
            });
        },
        updateTempStats() {
            this.stats = Object.assign({}, this.characterStats);
            this.bonusStats = Object.assign({}, this.characterBonusStats);
            this.attributes = Object.assign({}, this.characterAttributes);
            this.tempStatusPoints = this.characterStatusPoints;

            this.recalculateStatCosts();
        },
        saveStats() {
            // Send stats and status points to server
            mo.socket.emit('saveCharacterStats', {
                ...this.stats,
                statusPoints: this.tempStatusPoints
            });
        },
        recalculateStatCosts() {
            for (const [key, value] of Object.entries(this.stats)) {
                this.statCost[key] = this.calculateCost(value);
            }
        },
        calculateCost(stat) {
            return Math.floor(stat / 10) + 2;
        },
        calculateAttributes() {
            mo.socket.emit('getCharacterHypotheticalAttributes', this.stats);
        },
        decreaseTempStat(stat) {
            // In case something went wrong, stop at 1
            if (this.stats[stat] <= 1 || this.stats[stat] === this.characterStats[stat]) {
                return false;
            }

            // Decrease stat
            this.stats[stat]--;

            // Re-calculate stat cost
            this.statCost[stat] = this.calculateCost(this.stats[stat]);

            // Increasing tempStatusPoints after recalculation
            this.tempStatusPoints += this.statCost[stat];

            // Triggering re-calculation of attributes
            this.calculateAttributes();
        },
        increaseTempStat(stat) {
            // In case something went wrong, stop at 99
            if (this.stats[stat] >= 99 || this.tempStatusPoints < this.statCost[stat]) {
                return false;
            }

            // Increase stat
            this.stats[stat]++;

            // Decreasing tempStatusPoints first
            this.tempStatusPoints -= this.statCost[stat];

            // Re-calculate stat cost
            this.statCost[stat] = this.calculateCost(this.stats[stat]);

            // Triggering re-calculation of attributes
            this.calculateAttributes();
        }
    }
};
</script>