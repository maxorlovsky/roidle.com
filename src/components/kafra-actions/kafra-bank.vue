<template>
    <div class="modal">
        <div class="modal__header">{{ $t('kafra.useBank') }}</div>

        <loading v-if="loading" />
        <div v-else
            class="modal__content kafra-actions__buttons"
        >
            <div class="form-heading">{{ $t('kafra.moneyInBank') }}: <b>{{ bankMoneyAmount }}Z</b></div>

            <input v-model="bankTransferFunds"
                :placeholder="$t('global.amount')"
                class="kafra-actions__bank-amount"
                type="number"
            >

            <div class="kafra-actions__bank">
                <button :disabled="buttonLoading || bankTransferFunds < 1"
                    class="btn game-button kafra-actions__bank__button"
                    @click="transferFunds('deposit')"
                >
                    {{ $t('kafra.deposit') }}
                </button>
                <button :disabled="buttonLoading || bankTransferFunds < 1"
                    class="btn game-button kafra-actions__bank__button"
                    @click="transferFunds('withdraw')"
                >
                    {{ $t('kafra.withdraw') }}
                </button>
            </div>

            <div class="kafra-actions__bank-transactions">
                <div v-if="bankTransactions && bankTransactions.length">
                    <div v-for="transaction in bankTransactions"
                        :key="transaction.id"
                        class="kafra-actions__transaction"
                    >
                        <b>{{ transaction.characterName }}</b>
                        <span>{{ $t(`kafra.${transaction.type}Transaction`, {
                            amount: transaction.money
                        }) }}</span>
                    </div>
                </div>
                <div v-else
                    class="kafra-actions__bank-transactions__empty"
                >
                    {{ $t('kafra.noTransactionsFound') }}
                </div>
            </div>
        </div>

        <div class="modal__buttons">
            <button class="btn btn-secondary"
                @click="closeBank()"
            >{{ $t('global.close') }}</button>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import loading from '@components/loading/loading.vue';

export default {
    name: 'kafra-bank',
    components: {
        loading
    },
    data() {
        return {
            loading: true,
            buttonLoading: true,
            bankMoneyAmount: 0,
            bankTransactions: [],
            bankTransferFunds: 0
        };
    },
    computed: {
        ...mapGetters(['characterZeny']),
    },
    watch: {
        bankTransferFunds() {
            let amount = Number(this.bankTransferFunds);

            if (amount < 0) {
                amount = 0;
            } else if (this.bankMoneyAmount > this.characterZeny && amount > this.bankMoneyAmount) {
                amount = this.bankMoneyAmount;
            } else if (this.characterZeny > this.bankMoneyAmount && amount > this.characterZeny) {
                amount = this.characterZeny;
            }

            this.bankTransferFunds = amount;
        }
    },
    mounted() {
        mo.socket.on('transferBankFundsComplete', (response) => {
            this.buttonLoading = false;

            // In case of success response update bank funds
            if (response.status) {
                this.bankTransferFunds = 0;

                // Update new zeny amount
                this.bankMoneyAmount = response.zeny;

                // Add new transaction
                this.bankTransactions.unshift(response.transaction);
            }
        });

        mo.socket.on('getBankFundsComplete', (response) => {
            // If response is negative we close bank
            if (!response.status) {
                this.closeBank();

                return false;
            }

            // Otherwise load values
            this.bankMoneyAmount = response.money;
            this.bankTransactions = response.transactions;

            this.buttonLoading = false;
            this.loading = false;
        });

        // Triggering on mounted, since if bank modal is suppose to be displayed
        mo.socket.emit('getBankFunds');
    },
    beforeDestroy() {
        // Sending request to close Kafra from this account
        mo.socket.emit('closeBank');

        mo.socket.off('transferBankFundsComplete');
        mo.socket.off('getBankFundsComplete');
    },
    methods: {
        closeBank() {
            this.$emit('close');
        },
        transferFunds(type) {
            this.buttonLoading = true;

            mo.socket.emit('transferBankFunds', type, Number(this.bankTransferFunds));
        }
    }
};
</script>