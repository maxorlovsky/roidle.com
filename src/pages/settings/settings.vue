<template>
    <section class="settings">
        <div class="settings-wrapper">
            <div class="settings__character-select">
                <div class="btn game-button"
                    @click="selectCharacter()"
                >{{ $t('settings.characterSelect') }}</div>
            </div>

            <div class="settings__config">
                <div class="settings__setting">
                    <div class="settings__setting__slider game-icon">
                        <div class="settings__setting__title">{{ $t('settings.music') }}</div>

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
                        <div class="settings__setting__title">{{ $t('settings.sound') }}</div>

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
                            class="icon"
                        />
                    </div>
                </div>

                <div v-if="admin"
                    class="settings__setting"
                >
                    <div class="settings__setting__slider game-icon">
                        <div class="settings__setting__title">{{ $t('settings.copyLinkToProfile') }}</div>
                    </div>

                    <div class="settings__setting__icon game-icon"
                        @click="copyToClipboard()"
                    >
                        <input id="publicUrl"
                            :value="`https://roidle.com/public/character/${characterName}`"
                            class="settings__setting__copy-link"
                            type="text"
                        >
                        <i class="icon icon-copy" />
                    </div>
                </div>

                <div class="settings__setting__socials">
                    <div class="settings__setting__socials__patreon">
                        <a href="https://www.patreon.com/roidle"
                            class="game-icon"
                            target="_blank"
                            rel="noopener nofollow"
                        >
                            <i class="icon icon-patreon" />
                        </a>
                    </div>

                    <div class="settings__setting__socials__discord">
                        <a href="https://discord.gg/PjApFha"
                            class="game-icon"
                            target="_blank"
                            rel="noopener nofollow"
                        >
                            <img :src="`${serverUrl}/dist/assets/images/discord.png`">
                        </a>
                    </div>

                    <div class="settings__setting__socials__reddit">
                        <a href="https://www.reddit.com/r/ROIdle"
                            class="game-icon"
                            target="_blank"
                            rel="noopener nofollow"
                        >
                            <i class="icon icon-reddit" />
                        </a>
                    </div>
                </div>

                <div class="settings__setting settings__setting--centered settings__setting__version">
                    v{{ version }}
                </div>

                <template v-if="admin">
                    <div class="settings__setting">
                        <div class="settings__setting__slider game-icon">
                            <div class="settings__setting__title">{{ $t('settings.closeLogins') }}</div>
                        </div>

                        <div class="settings__setting__icon game-icon"
                            @click="closeLogin()"
                        >
                            <i :class="{'settings__setting__icon--enabled': allowLogins, 'settings__setting__icon--disabled': !allowLogins}"
                                class="icon icon-turn-off"
                            />
                        </div>
                    </div>

                    <div class="settings__setting">
                        <div class="settings__setting__slider game-icon">
                            <div class="settings__setting__title">{{ $t('settings.kickOnlineUsers') }}</div>
                        </div>

                        <div class="settings__setting__icon game-icon"
                            @click="kickUsers()"
                        >
                            <i class="icon icon-turn-off" />
                        </div>
                    </div>

                    <div class="settings__setting">
                        <div class="settings__setting__slider game-icon">
                            <div class="settings__setting__title">Connected users</div>
                        </div>

                        <router-link to="/all-users"
                            class="settings__setting__icon game-icon"
                        >
                            X
                        </router-link>
                    </div>

                    <div class="settings__setting">
                        <div class="settings__setting__slider game-icon">
                            <div class="settings__setting__title">Active hunts</div>
                        </div>

                        <router-link to="/all-hunts"
                            class="settings__setting__icon game-icon"
                        >
                            X
                        </router-link>
                    </div>
                </template>
            </div>

            <div class="settings__statistics">
                <loading v-if="loading" />
                <template v-else>
                    <div v-for="(value, key) in statistics"
                        :key="key"
                        class="settings__statistic"
                    >
                        <div class="settings__statistic__name">{{ $t(`statistics.${key}`) }}</div>
                        <div class="settings__statistic__value">{{ value }}</div>
                    </div>
                </template>
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters, mapActions } from 'vuex';
import RangeSlider from 'vue-range-slider';

// Utilities
import { functions } from '@utils/functions.js';

// Components
import loading from '@components/loading/loading.vue';

const settingsPage = {
    components: {
        RangeSlider,
        loading
    },
    data() {
        return {
            loading: true,
            musicSliderValue: this.$store.state.musicVolume,
            soundSliderValue: this.$store.state.soundVolume,
            version: mo.version,
            allowLogins: true,
            statistics: null
        };
    },
    computed: {
        ...mapGetters([
            'music',
            'sound',
            'admin',
            'serverUrl',
            'characterName'
        ]),
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
        if (this.admin) {
            mo.socket.on('getAdminConfigComplete', (response) => {
                this.allowLogins = response.gameConfig.allowLogins;
            });

            mo.socket.emit('getAdminConfig');
        }

        mo.socket.on('getStatisticsComplete', (response) => {
            this.loading = false;
            this.statistics = response;

            this.formatAgeStatistic();
        });

        mo.socket.emit('getStatistics');
    },
    beforeDestroy() {
        if (this.admin) {
            mo.socket.off('getAdminConfigComplete');
        }

        mo.socket.off('getStatisticsComplete');
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

        formatAgeStatistic() {
            if (!this.statistics.age) {
                return false;
            }

            let returnDateString = '';


            if (this.statistics.age.years) {
                returnDateString += `${this.statistics.age.years} ${this.$t('statistics.years')} `;
            }

            if (this.statistics.age.months) {
                returnDateString += `${this.statistics.age.months} ${this.$t('statistics.months')} `;
            }

            returnDateString += `${this.statistics.age.days} ${this.$t('statistics.days')} `;

            this.statistics.age = returnDateString;
        },
        copyToClipboard() {
            const copyText = document.getElementById('publicUrl');

            /* Select the text field */
            copyText.select();
            copyText.setSelectionRange(0, 99999);

            /* Copy the text inside the text field */
            document.execCommand('copy');

            this.$store.commit('sendChat', [
                {
                    type: 'system',
                    character: 'System',
                    message: this.$t('settings.linkToProfileCopied')
                }
            ]);
        },
        kickUsers() {
            mo.socket.emit('adminKickUsers');
        },
        closeLogin() {
            this.allowLogins = !this.allowLogins;

            mo.socket.emit('adminConfig', {
                allowLogins: this.allowLogins
            });
        },
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

            this.$router.push('/character-select');
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