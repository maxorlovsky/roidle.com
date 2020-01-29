<template>
    <div class="level-up">
        <img v-if="showLevelUpAnimation"
            src="/dist/assets/level-up-anim.webp"
            class="level-up__animation"
        >

        <audio ref="levelUpAudio"
            src="/dist/assets/levelup.wav"
        />
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Configs
import exp from '../../../config/exp.json';

// Utils
import statsUtils from '../../utils/stats.js';

export default {
    name: 'level-up',
    data() {
        return {
            showLevelUpAnimation: false,
            maxHp: 0,
            maxMp: 0
        };
    },
    computed: {
        ...mapGetters([
            'characterBaseExp',
            'characterJobExp',
            'characterBaseLevel',
            'characterJobLevel',
            'characterJobId',
            'characterStats',
            'characterStatusPoints',
            'characterSkillPoints'
        ])
    },
    watch: {
        characterBaseExp() {
            this.checkBaseLevelUp();
        },
        characterJobExp() {
            this.checkJobLevelUp();
        }
    },
    mounted() {
        this.$refs.levelUpAudio.volume = 0.3;
    },
    methods: {
        showLevelAnim() {
            this.showLevelUpAnimation = true;

            setTimeout(() => {
                this.stopLevelAnim();
            }, 1500);
        },
        stopLevelAnim() {
            this.showLevelUpAnimation = false;
        },
        checkBaseLevelUp() {
            const expTable = exp.exp.split(',');

            if (this.characterBaseExp >= expTable[this.characterBaseLevel]) {
                // Storring new exp amount and level, to retrigger level up just in case
                this.$store.dispatch('levelUpBase', {
                    baseLevel: this.characterBaseLevel + 1,
                    baseExp: this.characterBaseExp - expTable[this.characterBaseLevel],
                    statusPoints: this.characterStatusPoints + Math.floor(this.characterBaseLevel / 5) + 3
                });

                // Triggering function to calculate maxHp/maxMp after level up
                this.calculateStats();

                // Heal up character after base level up
                this.$store.dispatch('updateHpMp', {
                    hp: this.maxHp,
                    mp: this.maxMp
                });

                // Delaying angel animation a bit, because of audio
                setTimeout(() => {
                    this.showLevelAnim();
                }, 1000);

                this.$refs.levelUpAudio.play();
            }
        },
        checkJobLevelUp() {
            // Calculating job exp into percentage of how much user currently have
            let expTable = null;

            if (this.characterJobId === 0) {
                expTable = exp.noviceExp.split(',');
            } else if (this.characterJobId > 1 && this.characterJobId < 6) {
                expTable = exp.firstJobs.split(',');
            } else {
                expTable = exp.secondJobs.split(',');
            }

            if (this.characterJobExp >= expTable[this.characterJobLevel]) {
                // Storring new exp amount and level, to retrigger level up just in case
                // Storring new exp amount and level, to retrigger level up just in case
                this.$store.dispatch('levelUpJob', {
                    jobLevel: this.characterJobLevel + 1,
                    jobExp: this.characterJobExp - expTable[this.characterJobLevel],
                    skillPoints: this.characterSkillPoints + 1
                });
            }
        },
        calculateStats() {
            this.maxHp = statsUtils.getHpFormula(this.characterJobId, this.characterBaseLevel, this.characterJobLevel, this.characterStats.vit);
            this.maxMp = statsUtils.getMpFormula(this.characterJobId, this.characterBaseLevel, this.characterJobLevel, this.characterStats.wis, this.characterStats.int);
        }
    }
};
</script>