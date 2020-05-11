<template>
    <section class="settings">
        <div class="settings-wrapper">
            <div class="settings__setting">
                <div class="btn game-button">Change character</div>
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
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters, mapActions } from 'vuex';
import RangeSlider from 'vue-range-slider';

const settingsPage = {
    components: {
        RangeSlider
    },
    data() {
        return {
            musicSliderValue: this.$store.state.musicVolume,
            soundSliderValue: this.$store.state.soundVolume
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
            'changeSoundVolume'
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