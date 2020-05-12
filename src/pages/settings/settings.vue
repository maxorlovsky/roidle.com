<template>
    <section class="settings">
        <div class="settings-wrapper">
            <div class="settings__setting settings__setting--centered">
                <div class="btn game-button"
                    @click="selectCharacter()"
                >Character select</div>
            </div>
            <div class="settings__setting">
                <div class="settings__setting__slider game-icon">
                    <div class="settings__setting__title">Music</div>

                    <range-slider v-model="musicSliderValue"
                        class="slider"
                        min="0"
                        max="1"
                        step="0.1"
                    />
                </div>

                <div class="settings__setting__icon game-icon"
                    @click="musicToggle"
                >
                    <i :class="{'icon-volume-on': music, 'icon-volume-off': !music}"
                        class="icon "
                    />
                </div>
            </div>

            <div class="settings__setting">
                <div class="settings__setting__slider game-icon">
                    <div class="settings__setting__title">Sound</div>

                    <range-slider v-model="soundSliderValue"
                        class="slider"
                        min="0"
                        max="1"
                        step="0.1"
                    />
                </div>

                <div class="settings__setting__icon game-icon"
                    @click="soundToggle"
                >
                    <i :class="{'icon-volume-on': sound, 'icon-volume-off': !sound}"
                        class="icon "
                    />
                </div>
            </div>

            <div class="settings__setting settings__setting--centered settings__setting__version">
                v{{ version }}
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters, mapActions } from 'vuex';
import RangeSlider from 'vue-range-slider';

// Globals functions
import { functions } from '@src/functions.js';

const settingsPage = {
    components: {
        RangeSlider
    },
    data() {
        return {
            musicSliderValue: this.$store.state.musicVolume,
            soundSliderValue: this.$store.state.soundVolume,
            version: mo.version
        };
    },
    computed: {
        ...mapGetters(['music', 'sound']),
    },
    watch: {
        musicSliderValue() {
            const volume = Number(this.musicSliderValue.toFixed(1));

            this.changeMusicVolume(volume);
        },
        soundSliderValue() {
            const volume = Number(this.soundSliderValue.toFixed(1));

            this.changeSoundVolume(volume);
        }
    },
    mounted() {
        // Hiding chat
        this.$store.commit('showChat', false);
    },
    beforeDestroy() {
        // Showing chat
        this.$store.commit('showChat', true);
    },
    methods: {
        ...mapActions([
            'musicOff',
            'musicOn',
            'changeMusicVolume',
            'soundOff',
            'soundOn',
            'changeSoundVolume',
            'resetState'
        ]),

        musicToggle() {
            if (this.music) {
                this.musicOff();
            } else {
                this.musicOn();
            }
        },
        soundToggle() {
            if (this.sound) {
                this.soundOff();
            } else {
                this.soundOn();
            }
        },
        selectCharacter() {
            this.$store.commit('displayDockedMenu', false);

            // Logout from character
            functions.storage('remove', 'selectedCharacter');

            this.$store.commit('socketConnection', false);

            this.$nextTick(() => {
                this.$store.commit('resetState');

                mo.socket.emit('exit');
                mo.socket = null;
            });

            this.$router.push('/?characters=1');
        }
    }
};

// Routing
mo.routes.push({
    path: '/settings',
    component: settingsPage
});

export default settingsPage;
</script>