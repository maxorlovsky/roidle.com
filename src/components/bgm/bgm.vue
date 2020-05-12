<template>
    <div class="bgm">
        <audio ref="music"
            :src="`/dist/assets/bgm/${musicFile}.mp3`"
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
        return {
            musicFile: '',
            inteval: null,
            volumeChangeValue: 0
        };
    },
    computed: {
        ...mapGetters([
            'characterLocationId',
            'music',
            'musicVolume'
        ])
    },
    watch: {
        characterLocationId() {
            this.stopBgm();
        },
        music() {
            this.detectMusicSettings();
        },
        musicVolume() {
            this.detectMusicSettings();
        }
    },
    mounted() {
        // On mounted user just connects to the game, so we need to specify random file to play
        const initialMusic = ['prontera', 'izlude'];
        const randomMusic = Math.floor(Math.random() * initialMusic.length);

        this.musicFile = initialMusic[randomMusic];

        // If we're on game page, we're not doing this, since it's probably refresh of the page
        if (this.$route.path !== '/game') {
            this.$nextTick(() => {
                this.detectMusicSettings();
            });
        }
    },
    beforeDestroy() {
        clearInterval(this.interval);
    },
    methods: {
        stopBgm() {
            // In case music is disabled we don't stop it gradually, we just update the music track in case user will want to enable it
            if (this.music && this.musicVolume > 0) {
                // Detecting how fast volume will fade away, depending on current music volume
                this.volumeChangeValue = this.musicVolume / 10;

                this.interval = setInterval(() => {
                    if (this.$refs.music.volume - this.volumeChangeValue <= this.volumeChangeValue) {
                        this.$refs.music.volume = 0;
                    } else {
                        this.$refs.music.volume -= this.volumeChangeValue;
                    }

                    if (this.$refs.music.volume <= 0) {
                        clearInterval(this.interval);

                        this.$refs.music.volume = 0;
                        this.$refs.music.pause();

                        this.loadNewTrack();
                    }
                }, 500);
            } else {
                this.loadNewTrack();
            }
        },
        startBgm() {
            // Detecting how fast volume will fade in, depending on current music volume
            this.volumeChangeValue = this.musicVolume / 10;

            this.$refs.music.currentTime = 0;
            this.$refs.music.play();

            this.interval = setInterval(() => {
                if (this.$refs.music.volume + this.volumeChangeValue >= 1) {
                    this.$refs.music.volume = 1;
                } else {
                    this.$refs.music.volume += this.volumeChangeValue;
                }

                if (this.$refs.music.volume >= this.musicVolume) {
                    clearInterval(this.interval);
                    this.$refs.music.volume = this.musicVolume;
                }
            }, 500);
        },
        loadNewTrack() {
            let musicTracks = [];
            let randomMusic = 0;

            switch (this.characterLocationId) {
                case 1:
                    musicTracks = ['prontera', 'prontera-original'];
                    randomMusic = Math.floor(Math.random() * musicTracks.length);
                    break;
                case 8:
                    musicTracks = ['izlude', 'izlude-original'];
                    randomMusic = Math.floor(Math.random() * musicTracks.length);
                    break;
                case 3:
                case 4:
                case 7:
                case 9:
                case 10:
                case 11:
                    musicTracks = ['prontera-field-1'];
                    break;
                case 2:
                case 5:
                case 6:
                    musicTracks = ['prontera-field-2'];
                    break;
                case 12:
                case 13:
                case 14:
                    musicTracks = ['prontera-field-3'];
                    break;
                default:
                    musicTracks = ['prontera', 'izlude'];
                    randomMusic = Math.floor(Math.random() * musicTracks.length);
                    break;
            }

            this.musicFile = musicTracks[randomMusic];

            // Same as above, start play music only if user have it enabled
            if (this.music && this.musicVolume > 0) {
                this.interval = setInterval(() => {
                    if (this.$refs.music.readyState) {
                        clearInterval(this.interval);
                        this.startBgm();
                    }
                }, 1000);
            }
        },
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