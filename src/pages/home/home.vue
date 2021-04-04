<template>
    <section class="home">
        <div class="home__logo">
            <img :src="`${serverUrl}/dist/assets/images/logo.png`">
        </div>

        <div class="home__early-access">
            <i class="icon icon-exclamation-mark" />
            <div>{{ $t('home.earlyAccessExplanation') }}</div>
        </div>

        <loading v-if="loading" />

        <div v-if="!loading && !isLoggedIn"
            class="home__auth-form"
        >
            <form method="post"
                class="home__auth-form__email"
                @submit.prevent="login"
            >
                <input v-model="form.email"
                    :placeholder="$t('home.email')"
                    class="home__auth-form__input"
                    type="email"
                >
                <input v-model="form.password"
                    :placeholder="$t('home.password')"
                    class="home__auth-form__input"
                    type="password"
                >
                <button :disabled="buttonLoading || !form.email || !form.password"
                    class="btn btn-lg game-button home__auth-form__button"
                >{{ $t('global.login') }}</button>

                <div :class="{'home__auth-form__message--visible': form.message}"
                    class="home__auth-form__message"
                    v-html="form.message"
                />
            </form>
            <div class="home__auth-form__helpers">
                <span @click="openReg()">{{ $t('home.registerAccount') }}</span>
            </div>
            <div class="home__auth-form__helpers">
                <span @click="openRestore()">{{ $t('home.forgotPassword') }}</span>
            </div>
        </div>

        <div v-if="!loading && !isLoggedIn"
            class="home__tap"
            @click="registerGuest()"
        >{{ $t('home.playNowRegisterLater') }}</div>

        <div v-if="!loading && isLoggedIn"
            class="home__tap"
            @click="loadGame()"
        >{{ $t('home.startGame') }}</div>

        <div v-if="isLoggedIn"
            class="home__logout"
        >
            <button class="btn btn-danger home__logout__button"
                @click="logout()"
            >{{ $t('global.logout') }}</button>
        </div>

        <div class="home__online game-icon">
            <div>{{ $t('home.online') }}: {{ online }}</div>
            <div>{{ $t('home.hunts') }}: {{ hunts }}</div>
            <div>{{ $t('global.players') }}: {{ playersRegistered }}</div>
        </div>

        <div class="home__wrapper">
            <div class="home__wrapper__features">
                <div class="home__wrapper__features__title">{{ $t('home.feature1Title') }}</div>
                <div class="home__wrapper__features__content">
                    <span>{{ $t('home.feature1Description') }}</span>
                    <div class="home__wrapper__features__content__screens">
                        <a :href="`${serverUrl}/dist/assets/images/screenshots/hunt1.png`"
                            target="_blank"
                        >
                            <img :src="`${serverUrl}/dist/assets/images/screenshots/hunt1-small.jpg`">
                        </a>
                        <a :href="`${serverUrl}/dist/assets/images/screenshots/hunt2.png`"
                            target="_blank"
                        >
                            <img :src="`${serverUrl}/dist/assets/images/screenshots/hunt2-small.jpg`">
                        </a>
                        <a :href="`${serverUrl}/dist/assets/images/screenshots/quests.png`"
                            target="_blank"
                        >
                            <img :src="`${serverUrl}/dist/assets/images/screenshots/quests-small.jpg`">
                        </a>
                    </div>
                </div>
            </div>

            <div class="home__wrapper__features">
                <div class="home__wrapper__features__title">{{ $t('home.feature2Title') }}</div>
                <div class="home__wrapper__features__content">
                    <span>{{ $t('home.feature2Description') }}</span>
                    <div class="home__wrapper__features__content__screens">
                        <a :href="`${serverUrl}/dist/assets/images/screenshots/levelup1.png`"
                            target="_blank"
                        >
                            <img :src="`${serverUrl}/dist/assets/images/screenshots/levelup1-small.jpg`">
                        </a>
                        <a :href="`${serverUrl}/dist/assets/images/screenshots/levelup2.png`"
                            target="_blank"
                        >
                            <img :src="`${serverUrl}/dist/assets/images/screenshots/levelup2-small.jpg`">
                        </a>
                    </div>
                </div>
            </div>

            <div class="home__wrapper__features">
                <div class="home__wrapper__features__title">{{ $t('home.feature3Title') }}</div>
                <div class="home__wrapper__features__content">
                    <span>{{ $t('home.feature3Description') }}</span>
                    <div class="home__wrapper__features__content__screens">
                        <a :href="`${serverUrl}/dist/assets/images/screenshots/party1.png`"
                            target="_blank"
                        >
                            <img :src="`${serverUrl}/dist/assets/images/screenshots/party1-small.jpg`">
                        </a>
                        <a :href="`${serverUrl}/dist/assets/images/screenshots/party2.png`"
                            target="_blank"
                        >
                            <img :src="`${serverUrl}/dist/assets/images/screenshots/party2-small.jpg`">
                        </a>
                    </div>
                </div>
            </div>

            <div class="home__wrapper__features">
                <div class="home__wrapper__features__title">{{ $t('home.feature4Title') }}</div>
                <div class="home__wrapper__features__content">
                    <span>{{ $t('home.feature4Description') }}</span>
                    <div class="home__wrapper__features__content__screens">
                        <a :href="`${serverUrl}/dist/assets/images/screenshots/craft1.png`"
                            target="_blank"
                        >
                            <img :src="`${serverUrl}/dist/assets/images/screenshots/craft1-small.jpg`">
                        </a>
                        <a :href="`${serverUrl}/dist/assets/images/screenshots/craft2.png`"
                            target="_blank"
                        >
                            <img :src="`${serverUrl}/dist/assets/images/screenshots/craft2-small.jpg`">
                        </a>
                        <a :href="`${serverUrl}/dist/assets/images/screenshots/craft3.png`"
                            target="_blank"
                        >
                            <img :src="`${serverUrl}/dist/assets/images/screenshots/craft3-small.jpg`">
                        </a>
                    </div>
                </div>
            </div>

            <div class="home__wrapper__features">
                <div class="home__wrapper__features__title">{{ $t('home.feature5Title') }}</div>
                <div class="home__wrapper__features__content">
                    <span>{{ $t('home.feature5Description') }}</span>
                    <div class="home__wrapper__features__content__screens">
                        <a :href="`${serverUrl}/dist/assets/images/screenshots/travel1.png`"
                            target="_blank"
                        >
                            <img :src="`${serverUrl}/dist/assets/images/screenshots/travel1-small.jpg`">
                        </a>
                        <a :href="`${serverUrl}/dist/assets/images/screenshots/travel2.png`"
                            target="_blank"
                        >
                            <img :src="`${serverUrl}/dist/assets/images/screenshots/travel2-small.jpg`">
                        </a>
                    </div>
                </div>
            </div>

            <div class="home__wrapper__features">
                <div class="home__wrapper__features__title">{{ $t('home.feature6Title') }}</div>
                <div class="home__wrapper__features__content">
                    <span>{{ $t('home.feature6Description') }}</span>
                    <div class="home__wrapper__features__content__screens">
                        <a :href="`${serverUrl}/dist/assets/images/screenshots/shop1.png`"
                            target="_blank"
                        >
                            <img :src="`${serverUrl}/dist/assets/images/screenshots/shop1-small.jpg`">
                        </a>
                        <a :href="`${serverUrl}/dist/assets/images/screenshots/shop2.png`"
                            target="_blank"
                        >
                            <img :src="`${serverUrl}/dist/assets/images/screenshots/shop2-small.jpg`">
                        </a>
                        <a :href="`${serverUrl}/dist/assets/images/screenshots/trade.png`"
                            target="_blank"
                        >
                            <img :src="`${serverUrl}/dist/assets/images/screenshots/trade-small.jpg`">
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <register v-if="showRegisterModal && !isLoggedIn"
            class="modal"
            @closeModal="showRegisterModal = false"
            @registrationSuccess="authenticate()"
        />

        <forgot-password v-if="showForgotPasswordModal && !isLoggedIn"
            class="modal"
            @closeModal="showForgotPasswordModal = false"
        />

    </section>
</template>

<script>
// 3rd party libs
import axios from 'axios';
import { mapGetters } from 'vuex';

// Utilities
import { functions } from '@utils/functions.js';

// Components
import loading from '@components/loading/loading.vue';
import register from '@components/register/register.vue';
import forgotPassword from '@components/forgot-password/forgot-password.vue';

const homePage = {
    components: {
        loading,
        register,
        forgotPassword
    },
    data() {
        return {
            loading: true,
            buttonLoading: false,
            isLoggedIn: false,
            showRegisterModal: false,
            showForgotPasswordModal: false,
            form: {
                login: '',
                password: '',
                message: ''
            }
        };
    },
    computed: {
        ...mapGetters([
            'isGuest',
            'serverUrl',
            'online',
            'hunts',
            'playersRegistered',
        ])
    },
    mounted() {
        // Check if user session is available and live
        if (functions.storage('get', 'session')) {
            this.authenticate();
        } else {
            // If not just remove loading state
            this.loading = false;
        }
    },
    methods: {
        async login() {
            this.buttonLoading = true;
            this.form.message = '';

            try {
                const response = await axios.post(`${mo.serverUrl}/api/login`, {
                    email: this.form.email,
                    password: this.form.password
                });

                // Store session in local storage
                functions.storage('set', 'session', response.data.sessionToken);

                // Send authenticate request
                this.authenticate();
            } catch (error) {
                if (error && error.response) {
                    this.form.message = error.response.data.errorMessage;
                } else {
                    console.error('ERROR #4');
                    console.error(error);
                    console.error(error.response);
                }
            } finally {
                this.buttonLoading = false;
            }
        },
        logout() {
            // Remove session token
            functions.storage('remove', 'session');

            // Reset is guest state
            this.$store.commit('setIsGuest', false);

            // Remove flag as logged in and cleanup characters
            this.isLoggedIn = false;
        },
        openReg() {
            this.showRegisterModal = true;
            this.showForgotPasswordModal = false;
        },
        openRestore() {
            this.showRegisterModal = false;
            this.showForgotPasswordModal = true;
        },
        loadGame() {
            // In case we're already loading, stop click events
            if (this.loading) {
                return false;
            }

            this.loading = true;

            // Check if we need to authenticate user or create a new one
            if (this.isLoggedIn) {
                this.$router.push('/character-select');
            } else {
                this.registerGuest();
            }
        },
        async authenticate() {
            try {
                const response = await axios.post(`${mo.serverUrl}/api/authenticate`, {
                    sessionToken: functions.storage('get', 'session')
                });

                // Reset form
                this.form.email = '';
                this.form.password = '';
                this.form.message = '';

                this.isLoggedIn = true;

                if (response.data.isGuest) {
                    this.$store.commit('setIsGuest', true);
                }
            } catch (error) {
                console.error('ERROR #1');
                console.error(error);
                console.error(error.response);
            } finally {
                this.loading = false;
                this.buttonLoading = false;
            }
        },
        async registerGuest() {
            try {
                const response = await axios.post(`${mo.serverUrl}/api/register`);

                functions.storage('set', 'session', response.data.sessionToken);

                this.$router.push('/character-select');
            } catch (error) {
                console.error('ERROR #2');
                console.error(error);
                console.error(error.response);
            } finally {
                this.loading = false;
            }
        }
    }
};

// Routing
mo.routes.push({
    path: '/',
    component: homePage
});

export default homePage;
</script>