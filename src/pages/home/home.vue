<template>
    <section :class="{'home--select-character': selectCharacter}"
        class="home"
    >
        <template v-if="selectCharacter">
            <div class="select-character-wrapper">
                <div v-for="item in characters"
                    :key="item.id"
                    class="home__select-character"
                    @click="chooseCharacter(item.id)"
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
                    class="character-view__proceed btn btn-warning btn-lg"
                    @click="registerCharacter()"
                >Create New Character</button>

                <div :class="{'character-view__message--visible': message}"
                    class="character-view__message"
                >{{ message }}</div>
            </div>
        </template>
        <template v-else>
            <volume-control-home />

            <div class="home__logo"><img src="/dist/assets/images/logo.png"></div>

            <loading v-if="loading" />
            <div v-else
                class="home__tap"
                @click="loadGame()"
            >Tap here to start</div>

            <div class="home__footer">
                <div class="home__footer__online game-icon">
                    Online: {{ online }}<br>
                    Hunts: {{ idle }}<br>
                    Players: {{ players }}
                </div>
                <a href="https://discord.gg/PjApFha"
                    class="home__footer__discord game-icon"
                    target="_blank"
                >
                    <img src="/dist/assets/images/discord.png">
                </a>
            </div>

            <div class="home__version">v{{ version }}</div>
        </template>
    </section>
</template>

<script>
// 3rd party libs
import axios from 'axios';
import io from 'socket.io-client';

// Globals functions
import { functions } from '@src/functions.js';

// Components
import loading from '@components/loading/loading.vue';
import avatar from '@components/avatar/avatar.vue';
import volumeControlHome from '@components/volume-control-home/volume-control-home.vue';

const homePage = {
    components: {
        avatar,
        loading,
        volumeControlHome
    },
    data() {
        return {
            loading: false,
            buttonLoading: false,
            selectCharacter: false,
            createCharacter: false,
            characters: [],
            name: '',
            gender: 'm',
            headStyle: 1,
            message: '',
            maxAmountCharacter: 5,
            online: 0,
            idle: 0,
            players: 0,
            version: mo.version
        };
    },
    beforeDestroy() {
        mo.socket.off('selectCharacterComplete');
    },
    mounted() {
        this.$nextTick(() => {
            if (this.$route.query.characters) {
                this.loadGame();
            }
        });

        this.getOnline();
    },
    methods: {
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
            if (functions.storage('get', 'session')) {
                this.authenticate();
            } else {
                this.register();
            }
        },
        async authenticate() {
            try {
                const response = await axios.post('/api/authenticate', {
                    sessionToken: functions.storage('get', 'session')
                });

                this.characters = response.data.characters;
                this.selectCharacter = true;
            } catch (error) {
                console.error('ERROR #1');
                console.error(error);
                console.error(error.response);
            } finally {
                this.loading = false;
            }
        },
        async register() {
            try {
                const response = await axios.post('/api/register');

                functions.storage('set', 'session', response.data.sessionToken);

                this.selectCharacter = true;
            } catch (error) {
                console.error('ERROR #2');
                console.error(error);
                console.error(error.response);
            } finally {
                this.loading = false;
            }
        },
        async chooseCharacter(characterId) {
            // If socket connection is already established, we ignore it
            if (mo.socket) {
                return false;
            }

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
                this.$store.commit('characterInit', response);

                this.$store.commit('displayDockedMenu', true);
                this.$store.commit('showChat', true);

                this.$router.push('/game');
            });

            mo.socket.on('connect_timeout', (timeout) => {
                console.error('TIMEOUT');
                console.error(timeout);
            });
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