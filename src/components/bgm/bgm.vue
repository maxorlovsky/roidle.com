<template>
    <div class="bgm">
        <audio ref="music"
            src="/dist/assets/bgm/izlude.mp3"
            loop
        />
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

export default {
    name: 'bgm',
    data() {
        return {};
    },
    computed: {
        ...mapGetters([
            'characterLocationId',
            'music',
            'musicVolume'
        ])
    },
    watch: {
        music() {
            this.detectMusicSettings();
        },
        musicVolume() {
            this.detectMusicSettings();
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.detectMusicSettings();
        });
    },
    methods: {
        detectMusicSettings() {
            if (!this.$refs.music) {
                return false;
            }

            if (this.musicVolume || this.musicVolume === 0) {
                this.$refs.music.volume = this.musicVolume;
            }

            if (this.music) {
                this.$refs.music.play();
            } else {
                this.$refs.music.pause();
            }
        }
    }
};
</script>