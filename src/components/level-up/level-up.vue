<template>
    <div class="level-up">
        <img v-if="showLevelUpAnimation"
            :src="`${serverUrl}/dist/assets/level-up-anim.webp`"
            class="level-up__animation"
        >

        <audio ref="levelUpAudio"
            :src="`${serverUrl}/dist/assets/sounds/levelup.wav`"
        />

        <audio ref="chatPing"
            :src="`${serverUrl}/dist/assets/sounds/chat-ping.mp3`"
        />

        <audio ref="tradePing"
            :src="`${serverUrl}/dist/assets/sounds/trade-ping.mp3`"
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
            'soundVolume',
            'serverUrl'
        ])
    },
    watch: {
        socketConnection() {
            if (this.socketConnection) {
                this.setUpSocketEvents();
            }
        },
        soundVolume() {
            this.setUpVolume();
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.setUpVolume();
        });
    },
    beforeDestroy() {
        mo.socket.off('experienceUpdate');
        mo.socket.off('levelUpBase');
        mo.socket.off('levelUpJob');
    },
    methods: {
        setUpVolume() {
            this.$refs.levelUpAudio.volume = this.soundVolume;
            this.$refs.chatPing.volume = this.soundVolume;
            this.$refs.tradePing.volume = this.soundVolume;
        },
        setUpSocketEvents() {
            mo.socket.on('tradePing', () => {
                this.$refs.tradePing.play();
            });

            mo.socket.on('chatPing', () => {
                this.$refs.chatPing.play();
            });

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
            });

            mo.socket.on('levelUpJob', (level) => {
                // Updating level
                this.$store.commit('saveLevels', {
                    jobLevel: level
                });

                // Add skill point
                this.$store.commit('saveSkillPoints', this.$store.state.characterSkillPoints + 1);
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