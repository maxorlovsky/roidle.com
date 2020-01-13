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
    </div>
</template>

<script>
// Configs
import jobs from '../../../config/jobs.json';

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
        jobLevel: {
            type: Number,
            required: true
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
            tempStatusPoints: 0,
        };
    },
    watch: {
        statusPoints() {
            // Every time vuex is updated, we will need to refresh temp status points with real value
            this.tempStatusPoints = this.statusPoints;
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

            // Triggering fetch of bonus stats
            this.calculateBonusStats();
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
        calculateBonusStats() {
            const foundJob = jobs.find((job) => job.id === this.jobId);
            let i = 0;

            for (const num of foundJob.statsBonuses.split(',')) {
                // In case job level reached, we stop calculating bonuses
                if (i >= this.jobLevel) {
                    return false;
                }

                switch (Number(num)) {
                    case 1:
                        this.bonusStats.str++;
                        break;
                    case 2:
                        this.bonusStats.dex++;
                        break;
                    case 3:
                        this.bonusStats.int++;
                        break;
                    case 4:
                        this.bonusStats.vit++;
                        break;
                    case 5:
                        this.bonusStats.wis++;
                        break;
                    case 6:
                        this.bonusStats.luk++;
                        break;
                    default:
                        break;
                }

                ++i;
            }
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
        }
    }
};
</script>