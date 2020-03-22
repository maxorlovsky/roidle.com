<template>
    <div class="stats">
        <div v-for="stat in statsNames"
            :key="stat"
            class="stats__stat"
        >
            <span class="stats__label">{{ stat }}:</span>
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
                class="btn btn-primary stats__apply"
                @click="saveStats()"
            >Save</button>
        </div>

        <div v-if="!hideParams"
            class="stats__attributes"
        >
            <div class="stats__params">
                <span class="stats__params__label">M.HP</span>
                <span class="stats__params__value">{{ attributes.maxHp + bonusStats.hp }}</span>
            </div>
            <div class="stats__params">
                <span class="stats__params__label">M.MP</span>
                <span class="stats__params__value">{{ attributes.maxMp + bonusStats.mp }}</span>
            </div>
            <div class="stats__params">
                <span class="stats__params__label">P.Atk</span>
                <span class="stats__params__value">{{ attributes.patk + bonusStats.patk }}</span>
            </div>
            <div class="stats__params">
                <span class="stats__params__label">M.Atk</span>
                <span class="stats__params__value">{{ attributes.matk + bonusStats.matk }}</span>
            </div>
            <div class="stats__params">
                <span class="stats__params__label">P.Def</span>
                <span class="stats__params__value">{{ attributes.pdef + bonusStats.pdef }}</span>
            </div>
            <div class="stats__params">
                <span class="stats__params__label">M.Def</span>
                <span class="stats__params__value">{{ attributes.mdef + bonusStats.mdef }}</span>
            </div>
            <div class="stats__params">
                <span class="stats__params__label">Hit</span>
                <span class="stats__params__value">{{ attributes.hit + bonusStats.hit }}</span>
            </div>
            <div class="stats__params">
                <span class="stats__params__label">Eva</span>
                <span class="stats__params__value">{{ attributes.eva + bonusStats.eva }}</span>
            </div>
            <div class="stats__params">
                <span class="stats__params__label">Speed</span>
                <span class="stats__params__value">+{{ attributes.speed }}%</span>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

export default {
    name: 'stats',
    props: {
        hideParams: {
            type: Boolean,
            default: false
        }
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
                maxHp: 0,
                maxMp: 0
            },
            tempStatusPoints: 0,
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
            'characterJobId'
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