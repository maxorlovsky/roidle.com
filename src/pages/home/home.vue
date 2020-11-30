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
                        :head-color="item.headColor"
                        :head-gears="item.headgearItemIds"
                        :gender="item.gender"
                        :job="item.job"
                        :framed="true"
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
                    :head-color="headColor"
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
                    <div class="character-pickers__buttons">
                        <Button class="btn btn-secondary"
                            @click="setColor('prev')"
                        > &#60; </Button>
                        <Button class="btn btn-secondary"
                            @click="setColor('next')"
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

                <div class="character-view__proceed character-view__wrapper">
                    <button :disabled="buttonLoading"
                        class="btn game-button btn-lg"
                        @click="registerCharacter()"
                    >Create New Character</button>
                </div>

                <div class="character-view__proceed character-view__wrapper">
                    <button :disabled="buttonLoading"
                        class="btn btn-secondary"
                        @click="switchToCharacterSelect()"
                    >Back to character select</button>
                </div>

                <div :class="{'character-view__message--visible': message}"
                    class="character-view__message"
                >{{ message }}</div>
            </div>
        </template>
        <template v-else>
            <div class="home__top-bar">
                <nav class="home__top-bar__links">
                    <router-link to="/">
                        Home
                    </router-link>
                    <a href="https://roidle.fandom.com/wiki/ROIdle_Wiki"
                        target="_blank"
                        rel="noopener nofollow"
                    >
                        Wiki
                    </a>
                </nav>
                <div class="home__top-bar__right">
                    <div class="home__top-bar__right__activity">
                        <div>Online: {{ online }}</div>
                        <div>Hunts: {{ hunts }}</div>
                        <div>Players registered: {{ players }}</div>
                    </div>

                    <a href="https://discord.gg/PjApFha"
                        class="home__top-bar__discord-link game-icon"
                        target="_blank"
                    >
                        <img :src="`${serverUrl}/dist/assets/images/discord.png`">
                    </a>

                    <volume-control-home />
                </div>
            </div>

            <div class="home__logo">
                <img :src="`${serverUrl}/dist/assets/images/logo.png`">
            </div>

            <div class="home__early-access">
                <i class="icon icon-exclamation-mark" />
                <div>This is a fan / hobby made game, done by one person and is currently in Open Alpha access.</div>
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

            <div class="home__online game-icon">
                <div>Online: {{ online }}</div>
                <div>Hunts: {{ hunts }}</div>
                <div>Players: {{ players }}</div>
            </div>

            <div class="home__wrapper">
                <div class="home__wrapper__features">
                    <div class="home__wrapper__features__title">Idle & inremental text MMORPG - hunt and do quests</div>
                    <div class="home__wrapper__features__content">
                        <span>Start with nothing and grow your character or many characters at the same time. Be whatever you want. Participating in what matter and let your character level up for you by hunting offline while still getting XP. Create party with your friends or control full party yourself. Do quests, be that of daily or story driver.</span>
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
                    <div class="home__wrapper__features__title">Level up your character and make unique build</div>
                    <div class="home__wrapper__features__content">
                        <span>There are no limits to stats and skills. You can create whatever you want. You want to go with meta? Go ahead and speak with other players what work best. But don't want to be as everyone else and want to do intelectual Knight with ton of mana? Go ahead. Want to do very bulky Mage or Healer? Sure, go crazy.</span>
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
                    <div class="home__wrapper__features__title">Don't go on adventure alone, it's dangerous</div>
                    <div class="home__wrapper__features__content">
                        <span>Either you want to create party with random people, your best friends or play alone as a full party team. All is possible. Play this game how you want. Min/Maxing is not the point. Party play is what important, this is what MMO is about. You won't survive alone or only with one character. You can create up to 10 characters on one account that share the same storage.</span>
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
                    <div class="home__wrapper__features__title">Don't like to hunt? Become a crafter.</div>
                    <div class="home__wrapper__features__content">
                        <span>Items wear out and break. Someone need to fix them. Items are not magically appearing in NPC stored. Someone need to create them and this someone can be you. Become the best crafter the world might know. Buy materials from adventurers and hunters. Create weapon, create armor, create potion, No loot item is useless as you can transmute them into what you might need.</span>
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
                    <div class="home__wrapper__features__title">Travel the map and face challenges in the dungeon.</div>
                    <div class="home__wrapper__features__content">
                        <span>Travel and explore the world, hunt stronger monster, get materials from them and sell them to Merchants. They will craft better gear for you instead. When dwelling the dungeons - don't get lost.</span>
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
                    <div class="home__wrapper__features__title">Become economical magnate.</div>
                    <div class="home__wrapper__features__content">
                        <span>Buy and sell stuff and lead the economy of the world by opening you shops in each city. You're in control of the prices. You're in control of the goods. If money making is your call, this is the road for you! Also, trade with players in real time.</span>
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

// Config
import ioConfig from '@config/io.json';

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
            headColor: 1,
            message: '',
            maxAmountCharacter: 10,
            online: 0,
            hunts: 0,
            crafts: 0,
            rests: 0,
            travels: 0,
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
        ...mapGetters([
            'isGuest',
            'serverUrl'
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
                const response = await axios.get(`${mo.serverUrl}/api/online?cache=${new Date().getTime()}`);

                this.online = response.data.online;
                this.hunts = response.data.hunts;
                this.travels = response.data.travels;
                this.crafts = response.data.crafts;
                this.rests = response.data.rests;
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
                const response = await axios.post(`${mo.serverUrl}/api/authenticate`, {
                    sessionToken: functions.storage('get', 'session')
                });

                // Reset form
                this.form.email = '';
                this.form.password = '';
                this.form.message = '';

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
                this.buttonLoading = false;
            }
        },
        async registerGuest() {
            try {
                const response = await axios.post(`${mo.serverUrl}/api/register`);

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
                const response = await axios.post(`${mo.serverUrl}/api/delete-character`, {
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
            mo.socket = await io(mo.serverUrl, ioConfig);

            this.$store.commit('socketConnection', true);

            // Send data to save character data
            mo.socket.emit('selectCharacter', {
                sessionToken: functions.storage('get', 'session'),
                characterId: characterId
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
                style = 23;
            } else if (style > 23) {
                style = 1;
            }

            this.headStyle = style;
        },
        setColor(pos) {
            let color = 0;

            switch (pos) {
                case 'prev':
                    color = this.headColor - 1;
                    break;
                default:
                    color = this.headColor + 1;
                    break;
            }

            if (color < 1) {
                color = 8;
            } else if (color > 8) {
                color = 1;
            }

            this.headColor = color;
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
                const response = await axios.post(`${mo.serverUrl}/api/create-character`, {
                    name: this.name,
                    gender: this.gender,
                    headStyle: this.headStyle,
                    headColor: this.headColor,
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