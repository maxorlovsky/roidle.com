<template>
    <div class="register">
        <div class="modal__header">{{ $t('home.forgotPassword') }}</div>
        <div class="modal__content">
            <input v-model="email"
                :placeholder="$t('forgotPassword.email')"
                class="register__input"
                type="email"
            >
            <input v-model="characterName"
                :placeholder="$t('forgotPassword.characterName')"
                class="register__input"
                type="text"
            >

            <div :class="{'register__message--visible': successMessage || errorMessage, 'register--success-message': successMessage}"
                class="register__message "
            >
                <template v-if="successMessage">
                    {{ $t('forgotPassword.successMessage') }}
                </template>
                <template v-else>
                    {{ $t('forgotPassword.errorMessage') }}
                </template>
            </div>
        </div>
        <div class="modal__buttons">
            <button class="btn btn-secondary"
                @click="closeModal()"
            >{{ $t('global.close') }}</button>

            <button :disabled="!ifFormFilled || buttonLoading"
                :class="{'disabled': buttonLoading}"
                class="btn game-button"
                @click="restoreSubmit()"
            >{{ $t('forgotPassword.requestPassword') }}</button>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import axios from 'axios';

export default {
    name: 'forgot-password',
    data() {
        return {
            buttonLoading: false,
            email: '',
            characterName: '',
            successMessage: false,
            errorMessage: false
        };
    },
    computed: {
        ifFormFilled() {
            return this.email && this.characterName;
        }
    },
    methods: {
        async restoreSubmit() {
            this.successMessage = false;
            this.errorMessage = false;
            this.buttonLoading = true;

            try {
                await axios.post(`${mo.serverUrl}/api/recovery-password`, {
                    email: this.email,
                    characterName: this.characterName
                });

                this.successMessage = true;
            } catch (error) {
                this.buttonLoading = false;
                this.errorMessage = true;
            }
        },
        closeModal() {
            this.$emit('closeModal');
        },
    }
};
</script>