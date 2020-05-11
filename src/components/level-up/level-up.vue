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

export default {
    name: 'level-up',
    data() {
        return {
            showLevelUpAnimation: false
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
            'characterSkillPoints',
            'socketConnection',
            'sound',
            'soundVolume'
        ])
    },
    watch: {
        socketConnection() {
            if (this.socketConnection) {
                this.setUpSocketEvents();
            }
        },
        soundVolume() {
            this.setLevelUpVolume();
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.setLevelUpVolume();
        });
    },
    beforeDestroy() {
        mo.socket.off('experienceUpdate');
        mo.socket.off('levelUpBase');
        mo.socket.off('levelUpJob');
    },
    methods: {
        setLevelUpVolume() {
            this.$refs.levelUpAudio.volume = this.soundVolume;
        },
        setUpSocketEvents() {
            mo.socket.on('experienceUpdate', (response) => {
                this.$store.commit('saveExp', {
                    baseExp: response.baseExp,
                    jobExp: response.jobExp,
                    baseExpPercentage: response.baseExpPercentage,
                    jobExpPercentage: response.jobExpPercentage
                });
            });

            mo.socket.on('levelUpBase', (response) => {
                // Updating level
                this.$store.commit('saveLevels', {
                    baseLevel: response.baseLevel
                });

                this.$store.commit('saveStatusPoints', response.statusPoints);

                // Delaying angel animation a bit, because of audio
                setTimeout(() => {
                    this.showLevelAnim();
                }, 1000);

                // Playing audio
                if (this.sound) {
                    this.$refs.levelUpAudio.play();
                }

                // Trigger re-fetch of the attributes
                mo.socket.emit('getCharacterStatsAttributes', this.characterStats);
            });

            mo.socket.on('levelUpJob', (level) => {
                // Updating level
                this.$store.commit('saveLevels', {
                    jobLevel: level
                });

                // Add skill point
                this.$store.commit('saveSkillPoints', this.$store.state.characterSkillPoints + 1);

                // Trigger re-fetch of the attributes
                mo.socket.emit('getCharacterStatsAttributes', this.characterStats);
            });
        },
        showLevelAnim() {
            this.showLevelUpAnimation = true;

            setTimeout(() => {
                this.stopLevelAnim();
            }, 1500);
        },
        stopLevelAnim() {
            this.showLevelUpAnimation = false;
        }
    }
};
</script>