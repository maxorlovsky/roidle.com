<template>
    <div class="stats">
        <div class="stats__wrapper">
            <div v-for="stat in statsNames"
                :key="stat"
                class="stats__stat"
            >
                <div class="stats__icon game-icon"
                    @click="showStatInfo(stat)"
                >
                    <img :src="`${serverUrl}/dist/assets/images/${stat}.png`">
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
                    <span class="stats__points__label">{{ $t('stats.statusPoints') }}:</span>
                    <span :class="{'stats__points__points--empty': tempStatusPoints === 0 }"
                        class="stats__points__points"
                    >{{ tempStatusPoints }}</span>
                </div>

                <button :disabled="tempStatusPoints === characterStatusPoints"
                    class="btn game-button stats__apply"
                    @click="saveStats()"
                >{{ $t('global.save') }}</button>
            </div>
        </div>

        <div v-if="statExplanation.show"
            class="modal"
            @click="statExplanation.show = false"
            v-html="statExplanation.statInfo"
        />
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters, mapActions } from 'vuex';

export default {
    name: 'stats',
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
            tempStatusPoints: 0,
            statExplanation: {
                show: false,
                statInfo: ''
            }
        };
    },
    computed: {
        ...mapGetters([
            'attributesComponents',
            'characterEquipment',
            'characterStats',
            'characterBonusStats',
            'characterAttributes',
            'characterStatusPoints',
            'characterJobLevel',
            'characterJobId',
            'characterJob',
            'partyName',
            'characterBaseLevel',
            'characterJobLevel',
            'serverUrl'
        ]),
    },
    watch: {
        characterStats: {
            immediate: true,
            handler() {
                this.updateTempStats();
            }
        },
        characterBonusStats: {
            handler() {
                this.bonusStats = Object.assign({}, this.characterBonusStats);
            }
        },
        characterAttributes: {
            handler() {
                this.setCharacterAttributes({
                    ...this.characterAttributes,
                    partyName: this.partyName,
                    job: this.characterJob,
                    baseLevel: this.characterBaseLevel,
                    jobLevel: this.characterJobLevel
                });
            }
        }
    },
    mounted() {
        // On hypo request, we update user attributes, this object is not really used for anything beside display, so it's safe to manipulate
        mo.socket.on('getCharacterHypotheticalAttributesComplete', (response) => {
            this.bonusStats = response.bonusStats;

            this.setCharacterAttributes({
                ...response.attributes,
                partyName: this.partyName,
                job: this.characterJob,
                baseLevel: this.characterBaseLevel,
                jobLevel: this.characterJobLevel
            });
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
                        message: this.$t('stats.errorTryingToUpdateStats')
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
        ...mapActions(['setCharacterAttributes']),

        showStatInfo(stat) {
            this.statExplanation.show = true;

            if (stat === 'str') {
                this.statExplanation.statInfo = `<b>${this.$t('stats.str')}</b>: ${this.$t('stats.strExplanation')}`;
            } else if (stat === 'dex') {
                this.statExplanation.statInfo = `<b>${this.$t('stats.dex')}</b>: ${this.$t('stats.dexExplanation')}`;
            } else if (stat === 'int') {
                this.statExplanation.statInfo = `<b>${this.$t('stats.int')}</b>: ${this.$t('stats.intExplanation')}`;
            } else if (stat === 'vit') {
                this.statExplanation.statInfo = `<b>${this.$t('stats.vit')}</b>: ${this.$t('stats.vitExplanation')}`;
            } else if (stat === 'wis') {
                this.statExplanation.statInfo = `<b>${this.$t('stats.wis')}</b>: ${this.$t('stats.wisExplanation')}`;
            } else if (stat === 'luk') {
                this.statExplanation.statInfo = `<b>${this.$t('stats.luk')}</b>: ${this.$t('stats.lukExplanation')}`;
            }
        },
        renewStats() {
            // Renew stats after the save, to represent what we have on backend
            this.$store.commit('setCharacterData', {
                stats: this.stats,
                bonusStats: this.bonusStats,
                attributes: this.attributesComponents,
                statusPoints: this.tempStatusPoints
            });
        },
        updateTempStats() {
            this.stats = Object.assign({}, this.characterStats);
            this.bonusStats = Object.assign({}, this.characterBonusStats);
            this.setCharacterAttributes({
                ...this.characterAttributes,
                partyName: this.partyName,
                job: this.characterJob,
                baseLevel: this.characterBaseLevel,
                jobLevel: this.characterJobLevel
            });
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