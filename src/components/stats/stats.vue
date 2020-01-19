<template>
    <div class="stats">
        <div v-for="stat in statsNames"
            :key="stat"
            class="stats__stat"
        >
            <span class="stats__label">{{ stat }}:</span>
            <div class="stats__numbers">
                <span class="stats__numbers__base">{{ tempStats[stat] }}</span>
                <span class="stats__numbers__bonus">+{{ bonusStats[stat] }}</span>
                <span class="stats__numbers__cost">
                    <span :class="{'stats__numbers__arrow--disabled': tempStatusPoints < statCost[stat]}"
                        class="stats__numbers__arrow"
                    >></span> {{ statCost[stat] }}
                </span>
            </div>
            <div :class="{'stats__incdec--disabled': tempStats[stat] === 1 || tempStats[stat] === stats[stat]}"
                class="stats__incdec"
                @click="decreaseTempStat(stat)"
            >-</div>
            <div :class="{'stats__incdec--disabled': tempStats[stat] === 99 || tempStatusPoints < statCost[stat]}"
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

            <button :disabled="tempStatusPoints === statusPoints"
                class="btn btn-primary stats__apply"
                @click="saveStats()"
            >Save</button>
        </div>

        <div v-if="!hideParams"
            class="stats__attributes"
        >
            <div class="stats__params">
                <span class="stats__params__label">M.HP</span>
                <span class="stats__params__value">{{ attributes.maxHp }}</span>
            </div>
            <div class="stats__params">
                <span class="stats__params__label">M.MP</span>
                <span class="stats__params__value">{{ attributes.maxMp }}</span>
            </div>
            <div class="stats__params">
                <span class="stats__params__label">P.Atk</span>
                <span class="stats__params__value">{{ attributes.patk }}</span>
            </div>
            <div class="stats__params">
                <span class="stats__params__label">M.Atk</span>
                <span class="stats__params__value">{{ attributes.matk }}</span>
            </div>
            <div class="stats__params">
                <span class="stats__params__label">P.Def</span>
                <span class="stats__params__value">{{ attributes.pdef }}</span>
            </div>
            <div class="stats__params">
                <span class="stats__params__label">M.Def</span>
                <span class="stats__params__value">{{ attributes.mdef }}</span>
            </div>
            <div class="stats__params">
                <span class="stats__params__label">Hit</span>
                <span class="stats__params__value">{{ attributes.hit }}</span>
            </div>
            <div class="stats__params">
                <span class="stats__params__label">Eva</span>
                <span class="stats__params__value">{{ attributes.eva }}</span>
            </div>
            <div class="stats__params">
                <span class="stats__params__label">Speed</span>
                <span class="stats__params__value">+{{ attributes.speed }}%</span>
            </div>
        </div>
    </div>
</template>

<script>
// Utils
import statsUtils from '../../utils/stats.js';

export default {
    name: 'stats',
    props: {
        stats: {
            type: Object,
            required: true
        },
        statusPoints: {
            type: Number,
            required: true
        },
        jobId: {
            type: Number,
            required: true
        },
        baseLevel: {
            type: Number,
            required: true
        },
        jobLevel: {
            type: Number,
            required: true
        },
        hideParams: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            statsNames: ['str', 'dex', 'int', 'vit', 'wis', 'luk'],
            tempStats: {
                str: 1,
                dex: 1,
                int: 1,
                vit: 1,
                wis: 1,
                luk: 1
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
    watch: {
        statusPoints: {
            immediate: true,
            handler() {
                // Every time vuex is updated, we will need to refresh temp status points with real value
                this.tempStatusPoints = this.statusPoints;
            }
        }
    },
    mounted() {
        // Awaiting props arrival
        this.$nextTick(() => {
            // Update temp stats with real stats
            for (const stat of this.statsNames) {
                this.tempStats[stat] = this.stats[stat];
            }

            // Triggering recalculation of the next stat
            this.recalculateStatCosts();

            // Fetching bonus stats of a job
            this.bonusStats = Object.assign({}, statsUtils.calculateBonusStats(this.jobId, this.jobLevel));

            // Triggering calculation of attributes
            this.calculateAttributes();
        });
    },
    methods: {
        saveStats() {
            this.$store.dispatch('saveStats', {
                str: this.tempStats.str,
                dex: this.tempStats.dex,
                int: this.tempStats.int,
                vit: this.tempStats.vit,
                wis: this.tempStats.wis,
                luk: this.tempStats.luk,
                statusPoints: this.tempStatusPoints
            });
        },
        calculateAttributes() {
            this.attributes.patk = statsUtils.getPatkFormula(this.jobId, this.baseLevel, this.jobLevel, this.tempStats.str, this.tempStats.dex, this.tempStats.luk);
            this.attributes.matk = statsUtils.getMatkFormula(this.jobId, this.baseLevel, this.jobLevel, this.tempStats.int, this.tempStats.dex, this.tempStats.luk);
            this.attributes.pdef = statsUtils.getPdefFormula(this.jobId, this.baseLevel, this.jobLevel, this.tempStats.vit, this.tempStats.wis);
            this.attributes.mdef = statsUtils.getMdefFormula(this.jobId, this.baseLevel, this.jobLevel, this.tempStats.wis, this.tempStats.vit);
            this.attributes.hit = statsUtils.getHitFormula(this.jobId, this.baseLevel, this.jobLevel, this.tempStats.dex, this.tempStats.luk);
            this.attributes.eva = statsUtils.getEvaFormula(this.jobId, this.baseLevel, this.jobLevel, this.tempStats.dex, this.tempStats.luk);
            this.attributes.speed = statsUtils.getSpeedFormula(this.tempStats.dex);

            this.attributes.maxHp = statsUtils.getHpFormula(this.jobId, this.baseLevel, this.jobLevel, this.tempStats.vit);
            this.attributes.maxMp = statsUtils.getMpFormula(this.jobId, this.baseLevel, this.jobLevel, this.tempStats.wis, this.tempStats.int);
        },
        recalculateStatCosts() {
            for (const [key, value] of Object.entries(this.tempStats)) {
                this.statCost[key] = this.calculateCost(value);
            }
        },
        calculateCost(stat) {
            return Math.floor(stat / 10) + 2;
        },
        decreaseTempStat(stat) {
            // In case something went wrong, stop at 1
            if (this.tempStats[stat] <= 1 || this.tempStats[stat] === this.stats[stat]) {
                return false;
            }

            // Decrease stat
            this.tempStats[stat]--;

            // Re-calculate stat cost
            this.statCost[stat] = this.calculateCost(this.tempStats[stat]);

            // Increasing tempStatusPoints after recalculation
            this.tempStatusPoints += this.statCost[stat];

            // Triggering re-calculation of attributes
            this.calculateAttributes();
        },
        increaseTempStat(stat) {
            // In case something went wrong, stop at 99
            if (this.tempStats[stat] >= 99 || this.tempStatusPoints < this.statCost[stat]) {
                return false;
            }

            // Increase stat
            this.tempStats[stat]++;

            // Decreasing tempStatusPoints first
            this.tempStatusPoints -= this.statCost[stat];

            // Re-calculate stat cost
            this.statCost[stat] = this.calculateCost(this.tempStats[stat]);

            // Triggering re-calculation of attributes
            this.calculateAttributes();
        }
    }
};
</script>