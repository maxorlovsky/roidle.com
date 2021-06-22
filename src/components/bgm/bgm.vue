<template>
    <div class="bgm">
        <audio ref="music"
            :src="`${serverUrl}/dist/assets/bgm/${musicFile}.mp3`"
            loop
        />

        <audio ref="ambience"
            :src="`${serverUrl}/dist/assets/bgm/${ambienceFile}.mp3`"
            loop
            autoplay
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
            ambienceFile: '',
            inteval: null,
            volumeChangeValue: 0
        };
    },
    computed: {
        ...mapGetters([
            'characterLocationId',
            'music',
            'musicVolume',
            'ambience',
            'ambienceVolume',
            'serverUrl',
            'currentLocation',
            'serverHour'
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
        },
        ambience() {
            this.detectAmbienceSettings();
        },
        ambienceVolume() {
            this.detectAmbienceSettings();
        },
        currentLocation() {
            // No ambience in the dungeons
            if (this.currentLocation && this.currentLocation.dungeon) {
                this.ambienceFile = '';
            } else {
                this.checkHours();
            }
        },
        serverHour() {
            this.checkHours();
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

        this.$refs.music.volume = this.musicVolume;
        this.$refs.ambience.volume = this.ambienceVolume;
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
                    break;
                case 8:
                    musicTracks = ['izlude', 'izlude-original'];
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
                case 15:
                case 16:
                case 17:
                case 20:
                case 21:
                    musicTracks = ['morocc-desert-1'];
                    break;
                case 22:
                case 23:
                case 26:
                case 28:
                case 29:
                case 30:
                case 31:
                case 32:
                case 34:
                case 35:
                    musicTracks = ['37'];
                    break;
                case 18:
                case 24:
                case 25:
                case 36:
                case 37:
                case 38:
                case 39:
                case 43:
                case 46:
                    musicTracks = ['03', 'peaceful-forest-mix'];
                    break;
                case 19:
                case 79:
                    musicTracks = ['52'];
                    break;
                case 27:
                    musicTracks = ['11'];
                    break;
                case 33:
                    musicTracks = ['45'];
                    break;
                case 40:
                case 41:
                case 42:
                case 44:
                case 45:
                    musicTracks = ['36'];
                    break;
                case 47:
                    musicTracks = ['15'];
                    break;
                case 48:
                case 49:
                    musicTracks = ['14'];
                    break;
                case 51:
                case 55:
                case 56:
                case 58:
                case 59:
                    musicTracks = ['23'];
                    break;
                case 50:
                case 54:
                case 57:
                    musicTracks = ['25'];
                    break;
                case 61:
                    musicTracks = ['04'];
                    break;
                case 65:
                    musicTracks = ['13', 'geffen-mix'];
                    break;
                case 52:
                case 53:
                case 60:
                    musicTracks = ['35'];
                    break;
                case 62:
                case 64:
                    musicTracks = ['64'];
                    break;
                case 63:
                    musicTracks = ['66'];
                    break;
                case 66:
                case 67:
                case 68:
                case 72:
                    musicTracks = ['31'];
                    break;
                case 69:
                case 73:
                case 74:
                case 75:
                    musicTracks = ['33'];
                    break;
                case 70:
                case 71:
                case 76:
                case 77:
                    musicTracks = ['34'];
                    break;
                case 78:
                    musicTracks = ['39'];
                    break;
                case 2000:
                case 2001:
                case 2002:
                case 2003:
                    musicTracks = ['19'];
                    break;
                case 2004:
                case 2005:
                    musicTracks = ['46'];
                    break;
                case 2006:
                case 2007:
                    musicTracks = ['20'];
                    break;
                case 2008:
                case 2009:
                    musicTracks = ['48'];
                    break;
                case 2010:
                case 2011:
                case 2012:
                case 2013:
                    musicTracks = ['29', '49'];
                    break;
                default:
                    musicTracks = ['prontera', 'izlude'];
                    break;
            }

            if (musicTracks && musicTracks.length > 1) {
                randomMusic = Math.floor(Math.random() * musicTracks.length);
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
        },
        detectAmbienceSettings() {
            if (this.ambienceVolume || this.ambienceVolume === 0) {
                this.$refs.ambience.volume = this.ambienceVolume;
            }
        },
        checkHours() {
            if ((this.serverHour >= 8 && this.serverHour <= 11) || (this.serverHour >= 19 && this.serverHour <= 23)) {
                this.ambienceFile = 'night-sounds';
            } else {
                this.ambienceFile = '';
            }
        }
    }
};
</script>