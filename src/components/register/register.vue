<template>
    <div class="register">
        <div class="modal__header">Register</div>
        <div class="modal__content">
            <input v-model="email"
                class="register__input"
                type="text"
                placeholder="Email"
            >
            <input v-model="password"
                class="register__input"
                type="password"
                placeholder="Password"
            >
            <input v-model="confirmPassword"
                class="register__input"
                type="password"
                placeholder="Confirm password"
            >

            <div :class="{'register__message--visible': message}"
                class="register__message"
                v-html="message"
            />
        </div>
        <div class="modal__buttons">
            <button class="btn btn-secondary"
                @click="closeModal()"
            >Close</button>

            <button :disabled="!ifFormFilled || buttonLoading"
                :class="{'disabled': buttonLoading}"
                class="btn game-button"
                @click="registerSubmit()"
            >Register</button>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import axios from 'axios';

// Globals functions
import { functions } from '@src/functions.js';

export default {
    name: 'register',
    data() {
        return {
            buttonLoading: false,
            email: '',
            password: '',
            confirmPassword: '',
            message: ''
        };
    },
    computed: {
        ifFormFilled() {
            return this.email && this.password && this.confirmPassword;
        }
    },
    methods: {
        async registerSubmit() {
            this.message = '';
            this.buttonLoading = true;

            try {
                const response = await axios.post('/api/register-account', {
                    email: this.email,
                    password: this.password,
                    confirmPassword: this.confirmPassword
                });

                functions.storage('set', 'session', response.data.sessionToken);

                this.$emit('registrationSuccess');
            } catch (error) {
                if (error && error.response) {
                    this.message = error.response.data.errorMessage;
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