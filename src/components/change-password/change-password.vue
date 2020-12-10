<template>
    <div class="change-password">
        <div class="modal__header">{{ $t('changePassword.title') }}</div>
        <div class="modal__content">
            <input v-model="oldPassword"
                :placeholder="$t('changePassword.oldPassword')"
                class="change-password__input"
                type="password"
            >
            <input v-model="newPassword"
                :placeholder="$t('changePassword.newPassword')"
                class="change-password__input"
                type="password"
            >
            <input v-model="confirmPassword"
                :placeholder="$t('changePassword.confirmPassword')"
                class="change-password__input"
                type="password"
            >

            <div :class="{'change-password__message--visible': message}"
                class="change-password__message"
                v-html="message"
            />
        </div>
        <div class="modal__buttons">
            <button class="btn btn-secondary"
                @click="closeModal()"
            >{{ $t('global.close') }}</button>

            <button :disabled="!ifFormFilled || buttonLoading"
                :class="{'disabled': buttonLoading}"
                class="btn game-button"
                @click="changePasswordSubmit()"
            >{{ $t('changePassword.change') }}</button>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import axios from 'axios';

// Utilities
import { functions } from '@utils/functions.js';

export default {
    name: 'change-password',
    data() {
        return {
            buttonLoading: false,
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
            message: ''
        };
    },
    computed: {
        ifFormFilled() {
            return this.oldPassword && this.newPassword && this.confirmPassword;
        }
    },
    methods: {
        async changePasswordSubmit() {
            this.message = '';
            this.buttonLoading = true;

            try {
                await axios.post(`${mo.serverUrl}/api/change-password`, {
                    oldPassword: this.oldPassword,
                    newPassword: this.newPassword,
                    confirmPassword: this.confirmPassword,
                    sessionToken: functions.storage('get', 'session')
                });

                this.$emit('passwordChanged');
            } catch (error) {
                if (error && error.response) {
                    this.message = this.$t(error.response.data.errorMessage, {
                        length: error.response.data.length
                    }) || error.response.data.message;
                } else {
                    console.error('ERROR #4');
                    console.error(error);
                    console.error(error.response);
                }
            } finally {
                this.buttonLoading = false;
            }
        },
        closeModal() {
            this.$emit('closeModal');
        },
    }
};
</script>