<template>
    <section :class="{'home--select-character': selectCharacter}"
        class="home"
    >
        <template v-if="selectCharacter">
            <div class="select-character-wrapper">
                <div v-if="isGuest"
                    class="home__guest-account game-icon"
                >
                    You are on guest account, your data can be easily lost if you like the game consider registering account by clicking here
                    <button :disabled="buttonLoading"
                        class="btn game-button home__guest-account__connect-account"
                        @click="connectGuestAccount()"
                    >Create and Connect account</button>
                </div>

                <div v-for="item in characters"
                    :key="item.id"
                    class="home__select-character"
                >
                    <avatar :head-style="item.headStyle"
                        :gender="item.gender"
                        :job="item.job"
                        :just-head="true"
                        :head-gear="item.headgearItemId"
                    />
                    <div class="home__select-character__info">
                        {{ item.name }} ({{ item.baseLevel }}/{{ item.jobLevel }})<br>
                        {{ item.job }}<br>
                        Location: {{ item.location }}
                    </div>

                    <div class="home__select-character__buttons">
                        <button :disabled="buttonLoading"
                            class="btn btn-sm btn-danger"
                            @click="deleteCharacter(item.id)"
                        >Delete</button>
                        <button :disabled="buttonLoading"
                            class="btn game-button"
                            @click="chooseCharacter(item.id)"
                        >Select character</button>
                    </div>
                </div>

                <div v-if="characters.length < maxAmountCharacter"
                    class="home__select-character home__select-character--create-new"
                    @click="switchToCreateCharacter()"
                >
                    Create new character
                </div>

                <button :disabled="buttonLoading"
                    class="character-view__proceed btn game-button"
                    @click="backToMain()"
                >Back to main screen</button>

                <div v-if="showDelete"
                    class="home__select-character__delete"
                >
                    <div class="home__select-character__delete__caution-text">Are you sure you want to delete this character?</div>
                    <button class="btn btn-secondary"
                        @click="closeDeleteModal()"
                    >No</button>
                    <button class="btn btn-danger"
                        @click="deleteConfirm()"
                    >Yes</button>
                </div>

                <register v-if="showRegisterModal && isLoggedIn && isGuest"
                    :guest="true"
                    class="modal"
                    @closeModal="showRegisterModal = false"
                    @accountConnected="accountConnected()"
                />
            </div>
        </template>
        <template v-else-if="createCharacter">
            <div class="character-view">
                <avatar :head-style="headStyle"
                    :gender="gender"
                />

                <div class="character-pickers">
                    <div class="character-pickers__buttons">
                        <Button class="btn btn-secondary"
                            @click="setGender(0)"
                        >Male</Button>
                        <Button class="btn btn-secondary"
                            @click="setGender(1)"
                        >Female</Button>
                    </div>
                    <div class="character-pickers__buttons">
                        <Button class="btn btn-secondary"
                            @click="setStyle('prev')"
                        > &#60; </Button>
                        <Button class="btn btn-secondary"
                            @click="setStyle('next')"
                        > &#62; </Button>
                    </div>
                </div>

                <div class="character-view__name">
                    <input v-model="name"
                        type="text"
                        class="character-view__name__input"
                        placeholder="What is your name?"
                    >
                </div>

                <button :disabled="buttonLoading"
                    class="character-view__proceed btn game-button btn-lg"
                    @click="registerCharacter()"
                >Create New Character</button>

                <button :disabled="buttonLoading"
                    class="character-view__proceed btn btn-secondary"
                    @click="switchToCharacterSelect()"
                >Back to character select</button>

                <div :class="{'character-view__message--visible': message}"
                    class="character-view__message"
                >{{ message }}</div>
            </div>
        </template>
        <template v-else>
            <volume-control-home />

            <div class="home__logo"><img src="/dist/assets/images/logo.png"></div>

            <loading v-if="loading" />

            <div v-if="!loading && !isLoggedIn"
                class="home__auth-form"
            >
                <form method="post"
                    class="home__auth-form__email"
                    @submit.prevent="login"
                >
                    <input v-model="form.email"
                        class="home__auth-form__input"
                        type="email"
                        placeholder="Email"
                    >
                    <input v-model="form.password"
                        class="home__auth-form__input"
                        type="password"
                        placeholder="Password"
                    >
                    <button :disabled="buttonLoading || !form.email || !form.password"
                        class="btn btn-lg game-button home__auth-form__button"
                    >Login</button>

                    <div :class="{'home__auth-form__message--visible': form.message}"
                        class="home__auth-form__message"
                        v-html="form.message"
                    />
                </form>
                <div class="home__auth-form__helpers">
                    <span @click="openReg()">Register account</span>
                </div>
            </div>

            <div v-if="!loading && !isLoggedIn"
                class="home__tap"
                @click="registerGuest()"
            >Play now, register later</div>

            <div v-if="!loading && isLoggedIn"
                class="home__tap"
                @click="loadGame()"
            >Start the game</div>

            <div v-if="isLoggedIn"
                class="home__logout"
            >
                <button class="btn btn-danger home__logout__button"
                    @click="logout()"
                >Logout</button>
            </div>

            <div class="home__footer">
                <div class="home__footer__online game-icon">
                    <div>Online: {{ online }}</div>
                    <div>Hunts: {{ idle }}</div>
                    <div>Players: {{ players }}</div>
                </div>
            </div>

            <div class="home__discord">
                <div class="home__discord__wrapper game-icon">
                    <div class="home__discord__disclaimer">For suggestions, problems, questions, bugs and persitent communication, join our discord by clicking logo below</div>
                    <a href="https://discord.gg/PjApFha"
                        class="home__discord__discord-link game-icon"
                        target="_blank"
                    >
                        <img src="/dist/assets/images/discord.png">
                    </a>
                </div>
            </div>

            <div class="home__version">v{{ version }}</div>

            <register v-if="showRegisterModal && !isLoggedIn"
                class="modal"
                @closeModal="showRegisterModal = false"
                @registrationSuccess="authenticate()"
            />
        </template>
    </section>
</template>

<script>
// 3rd party libs
import axios from 'axios';
import io from 'socket.io-client';
import { mapGetters } from 'vuex';

// Globals functions
import { functions } from '@src/functions.js';

// Components
import loading from '@components/loading/loading.vue';
import avatar from '@components/avatar/avatar.vue';
import volumeControlHome from '@components/volume-control-home/volume-control-home.vue';
import register from '@components/register/register.vue';

const homePage = {
    components: {
        avatar,
        loading,
        volumeControlHome,
        register
    },
    data() {
        return {
            loading: true,
            buttonLoading: false,
            isLoggedIn: false,
            selectCharacter: false,
            createCharacter: false,
            showDelete: false,
            deleteCharacterId: 0,
            characters: [],
            name: '',
            gender: 'm',
            headStyle: 1,
            message: '',
            maxAmountCharacter: 5,
            online: 0,
            idle: 0,
            players: 0,
            version: mo.version,
            showRegisterModal: false,
            form: {
                login: '',
                password: '',
                message: ''
            }
        };
    },
    computed: {
        ...mapGetters(['isGuest'])
    },
    beforeDestroy() {
        mo.socket.off('selectCharacterComplete');
    },
    mounted() {
        // Check if user session is available and live
        if (functions.storage('get', 'session')) {
            this.authenticate();
        } else {
            // If not just remove loading state
            this.loading = false;
        }

        this.getOnline();
    },
    methods: {
        accountConnected() {
            // Reset is guest state
            this.$store.commit('setIsGuest', false);

            // Hiding modal
            this.showRegisterModal = false;
        },
        connectGuestAccount() {
            this.showRegisterModal = true;
        },
        async login() {
            this.buttonLoading = true;
            this.form.message = '';

            try {
                const response = await axios.post('/api/login', {
                    email: this.form.email,
                    password: this.form.password
                });

                // Reset form
                this.form.email = '';
                this.form.password = '';
                this.form.message = '';

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
            this.characters = [];
        },
        openReg() {
            this.showRegisterModal = true;
        },
        backToMain() {
            this.$router.push('/');
            this.selectCharacter = false;
        },
        async getOnline() {
            try {
                const response = await axios.get(`/api/online?cache=${new Date().getTime()}`);

                this.online = response.data.online;
                this.idle = response.data.idle;
                this.players = response.data.registered;
            } catch (error) {
                console.error(error);
            }
        },
        loadGame() {
            // In case we're already loading, stop click events
            if (this.loading || this.selectCharacter || this.createCharacter) {
                return false;
            }

            this.loading = true;

            // Check if we need to authenticate user or create a new one
            if (this.isLoggedIn) {
                this.selectCharacter = true;
                this.loading = false;
            } else {
                this.registerGuest();
            }
        },
        async authenticate() {
            try {
                const response = await axios.post('/api/authenticate', {
                    sessionToken: functions.storage('get', 'session')
                });

                this.isLoggedIn = true;
                this.characters = response.data.characters;

                if (response.data.isGuest) {
                    this.$store.commit('setIsGuest', true);
                }

                // In case in query we have characters specified, we load directly into them
                this.$nextTick(() => {
                    if (this.$route.query.characters) {
                        this.loadGame();
                    }
                });
            } catch (error) {
                console.error('ERROR #1');
                console.error(error);
                console.error(error.response);
            } finally {
                this.loading = false;
            }
        },
        async registerGuest() {
            try {
                const response = await axios.post('/api/register');

                functions.storage('set', 'session', response.data.sessionToken);

                this.selectCharacter = true;
                this.isLoggedIn = true;
            } catch (error) {
                console.error('ERROR #2');
                console.error(error);
                console.error(error.response);
            } finally {
                this.loading = false;
            }
        },
        async deleteConfirm() {
            this.buttonLoading = true;

            try {
                const response = await axios.post('/api/delete-character', {
                    sessionToken: functions.storage('get', 'session'),
                    characterId: this.deleteCharacterId
                });

                this.characters = response.data.characters;

                this.closeDeleteModal();
            } catch (error) {
                console.error('ERROR #2');
                console.error(error);
                console.error(error.response);
            } finally {
                this.buttonLoading = false;
            }
        },
        closeDeleteModal() {
            this.deleteCharacterId = 0;
            this.showDelete = false;
        },
        deleteCharacter(characterId) {
            this.deleteCharacterId = characterId;
            this.showDelete = true;
        },
        async chooseCharacter(characterId) {
            // If socket connection is already established, we ignore it
            if (mo.socket) {
                return false;
            }

            this.buttonLoading = true;

            // Saving selected character
            functions.storage('set', 'selectedCharacter', characterId);

            // If authentication succeeded and character is selected we connect to socket
            // Storring it in global variable
            mo.socket = await io({
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: Infinity,
                timeout: 60000
            });

            this.$store.commit('socketConnection', true);

            // Send data to save character data
            mo.socket.emit('selectCharacter', {
                sessionToken: functions.storage('get', 'session'),
                characterId: characterId
            });

            // If socket is registered, we're progressing by fetching user data
            mo.socket.on('selectCharacterComplete', (response) => {
                // Triggering another call to fetch inventory
                mo.socket.emit('getInventory');

                this.$store.commit('characterInit', response);

                this.$store.commit('displayDockedMenu', true);
                this.$store.commit('showChat', true);

                this.buttonLoading = false;

                this.$router.push('/game');
            });
        },
        switchToCharacterSelect() {
            this.createCharacter = false;
            this.selectCharacter = true;
        },
        switchToCreateCharacter() {
            this.createCharacter = true;
            this.selectCharacter = false;
        },
        setStyle(pos) {
            let style = 0;

            switch (pos) {
                case 'prev':
                    style = this.headStyle - 1;
                    break;
                default:
                    style = this.headStyle + 1;
                    break;
            }

            if (style < 1) {
                style = 3;
            } else if (style > 3) {
                style = 1;
            }

            this.headStyle = style;
        },
        setGender(gender) {
            switch (gender) {
                case 1:
                    this.gender = 'f';
                    break;
                default:
                    this.gender = 'm';
                    break;
            }

            this.headStyle = 1;
        },
        async registerCharacter() {
            // Cleaning up message in case it's a second try
            this.message = '';
            this.buttonLoading = true;

            if (!this.checkName()) {
                this.buttonLoading = false;

                return false;
            }

            if (!functions.storage('get', 'session')) {
                this.message = 'Your session expired, please reload the app';
                this.buttonLoading = false;

                return false;
            }

            try {
                const response = await axios.post('/api/create-character', {
                    name: this.name,
                    gender: this.gender,
                    headStyle: this.headStyle,
                    sessionToken: functions.storage('get', 'session')
                });

                this.createCharacter = false;
                this.selectCharacter = true;

                // Drop form values
                this.name = '';
                this.gender = 'm';
                this.headStyle = 1;
                this.message = '';

                // Populate character with new response
                this.characters = response.data.characters;
            } catch (error) {
                console.error('ERROR #3');
                console.error(error);
                console.error(error.response);

                this.message = error.response.data.errorMessage;
            } finally {
                this.buttonLoading = false;
            }
        },
        checkName() {
            if (!this.name) {
                this.message = 'Name missing';

                return false;
            }

            const reg = /^\w+$/g;

            if (!reg.test(this.name)) {
                this.message = 'Name is incorrect, use normal letters and symbols';

                return false;
            }

            return true;
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