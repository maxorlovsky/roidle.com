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

export default {
    name: 'level-up',
    data() {
        return {
            showLevelUpAnimation: false
        };
    },
    computed: {
        ...mapGetters(['characterBaseExp', 'characterJobExp', 'characterBaseLevel', 'characterJobLevel', 'characterJobId', 'characterStatusPoints', 'characterSkillPoints'])
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
        }
    }
};
</script>