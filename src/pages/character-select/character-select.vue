<template>
    <section class="character-select">
        <loading v-if="loading" />
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
                        >{{ $t('characterSelect.male') }}</Button>
                        <Button class="btn btn-secondary"
                            @click="setGender(1)"
                        >{{ $t('characterSelect.female') }}</Button>
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
                        :placeholder="$t('characterSelect.tellTheName')"
                        type="text"
                        class="character-view__name__input"
                    >
                </div>

                <div class="character-view__proceed character-view__wrapper">
                    <button :disabled="buttonLoading"
                        class="btn game-button btn-lg"
                        @click="registerCharacter()"
                    >{{ $t('characterSelect.createNewCharacter') }}</button>
                </div>

                <div class="character-view__proceed character-view__wrapper">
                    <button :disabled="buttonLoading"
                        class="btn btn-secondary"
                        @click="switchToCharacterSelect()"
                    >{{ $t('characterSelect.backToCharacterSelect') }}</button>
                </div>

                <div :class="{'character-view__message--visible': message}"
                    class="character-view__message"
                >{{ message }}</div>
            </div>
        </template>
        <template v-else>
            <div class="select-character-wrapper">
                <div v-if="isGuest"
                    class="character-select__guest-account game-icon"
                >
                    <div>{{ $t('characterSelect.youAreGuestAccount') }}</div>
                    <button :disabled="buttonLoading"
                        class="btn game-button character-select__guest-account__connect-account"
                        @click="connectGuestAccount()"
                    >{{ $t('characterSelect.createAndConnectAccount') }}</button>
                </div>

                <div v-for="character in characters"
                    :key="character.id"
                    class="character-select__select-character"
                >
                    <avatar :head-style="character.headStyle"
                        :head-color="character.headColor"
                        :dye-color="character.dyeColor"
                        :head-gears="character.headgearItemIds"
                        :gender="character.gender"
                        :job="character.job"
                        :framed="true"
                    />
                    <div class="character-select__select-character__info">
                        {{ character.name }} ({{ character.baseLevel }}/{{ character.jobLevel }})<br>
                        {{ character.job }}<br>
                        {{ $t('global.location') }}: {{ character.location }}
                    </div>

                    <div class="character-select__select-character__buttons">
                        <button :disabled="buttonLoading"
                            class="btn btn-sm btn-danger"
                            @click="deleteCharacter(character.id)"
                        >{{ $t('global.delete') }}</button>
                        <button :disabled="buttonLoading"
                            class="btn game-button"
                            @click="chooseCharacter(character.id)"
                        >{{ $t('characterSelect.selectCharacter') }}</button>
                    </div>
                </div>

                <div v-if="characters.length < maxAmountCharacter"
                    class="character-select__select-character character-select__select-character--create-new"
                    @click="switchToCreateCharacter()"
                >
                    {{ $t('characterSelect.createNewCharacter') }}
                </div>

                <div class="character-select__select-character character-select__select-character--create-new"
                    @click="showChangePasswordModal = true"
                >
                    {{ $t('characterSelect.changePassword') }}
                </div>

                <button :disabled="buttonLoading"
                    class="character-view__proceed btn game-button"
                    @click="backToMain()"
                >{{ $t('characterSelect.backToMainScreen') }}</button>

                <div v-if="showDelete"
                    class="character-select__select-character__delete"
                >
                    <div class="character-select__select-character__delete__caution-text">{{ $t('characterSelect.deleteCharacterConfirmation') }}</div>

                    <input v-model="deleteConfirmationUserText"
                        class="character-select__select-character__delete__text-input"
                    >

                    <div class="character-select__select-character__delete__buttons">
                        <button class="btn btn-secondary"
                            @click="closeDeleteModal()"
                        >{{ $t('global.no') }}</button>
                        <button :disabled="deleteConfirmationUserText !== $t('characterSelect.deleteCharacterConfirmationWord')"
                            class="btn btn-danger"
                            @click="deleteConfirm()"
                        >{{ $t('global.yes') }}</button>
                    </div>
                </div>

                <register v-if="showRegisterModal && isGuest"
                    :guest="true"
                    class="modal"
                    @closeModal="showRegisterModal = false"
                    @accountConnected="accountConnected()"
                />

                <change-password v-if="showChangePasswordModal && !isGuest"
                    class="modal"
                    @closeModal="showChangePasswordModal = false"
                    @passwordChanged="passwordChanged()"
                />
            </div>
        </template>
    </section>
</template>

<script>
// 3rd party libs
import axios from 'axios';
import { io } from 'socket.io-client';
import { mapGetters } from 'vuex';

// Utilities
import { functions } from '@utils/functions.js';

// Config
import ioConfig from '@config/io.json';

// Components
import loading from '@components/loading/loading.vue';
import avatar from '@components/avatar/avatar.vue';
import register from '@components/register/register.vue';
import changePassword from '@components/change-password/change-password.vue';

const characterSelectPage = {
    components: {
        avatar,
        loading,
        register,
        changePassword
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
            gender: this.$t('characterSelect.maleSingleLetter'),
            headStyle: 1,
            headColor: 1,
            message: '',
            maxAmountCharacter: 10,
            showRegisterModal: false,
            showChangePasswordModal: false,
            deleteConfirmationUserText: ''
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
            // Kick user back to home screen
            this.$router.replace('/');
        }
    },
    methods: {
        passwordChanged() {
            // Hiding modal
            this.showChangePasswordModal = false;
        },
        accountConnected() {
            // Reset is guest state
            this.$store.commit('setIsGuest', false);

            // Hiding modal
            this.showRegisterModal = false;
        },
        connectGuestAccount() {
            this.showRegisterModal = true;
        },
        backToMain() {
            this.$router.replace('/');
            this.selectCharacter = false;
        },
        async authenticate() {
            try {
                const response = await axios.post(`${mo.serverUrl}/api/authenticate`, {
                    sessionToken: functions.storage('get', 'session')
                });

                if (!response) {
                    // Kick user back to home screen
                    this.$router.replace('/');
                }

                this.characters = response.data.characters;

                if (response.data.isGuest) {
                    this.$store.commit('setIsGuest', true);
                }
            } catch (error) {
                // Kick user back to home screen
                this.$router.replace('/');
            } finally {
                this.loading = false;
                this.buttonLoading = false;
            }
        },
        async deleteConfirm() {
            this.deleteConfirmationUserText = '';
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
            this.deleteConfirmationUserText = '';
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
        },
        switchToCreateCharacter() {
            this.createCharacter = true;
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
                    this.gender = this.$t('characterSelect.femaleSingleLetter');
                    break;
                default:
                    this.gender = this.$t('characterSelect.maleSingleLetter');
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
                this.message = this.$t('characterSelect.sessionExpired');
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
                this.gender = this.$t('characterSelect.maleSingleLetter');
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
                this.message = this.$t('characterSelect.nameMissing');

                return false;
            }

            const reg = /^\w+$/g;

            if (!reg.test(this.name)) {
                this.message = this.$t('characterSelect.nameIncorrect');

                return false;
            }

            return true;
        }
    }
};

// Routing
mo.routes.push({
    path: '/character-select',
    component: characterSelectPage
});

export default characterSelectPage;
</script>