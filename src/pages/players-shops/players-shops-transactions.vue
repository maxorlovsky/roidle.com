<template>
    <div class="players-shops__transactions">
        <div class="players-shops__title">{{ $t('shop.transactions') }}</div>

        <loading v-if="loading" />
        <template v-else>
            <div v-for="transaction in transactions"
                :key="transaction.id"
                class="players-shops__transactions-item"
            >
                <div :class="{
                        'players-shops__transactions-item__item--broken': transaction.broken,
                        'players-shops__transactions-item__item--not-pristine': transaction.defaultDurability && transaction.durability < transaction.defaultDurability,
                        'players-shops__transactions-item__item--high-quality': transaction.durability && transaction.durability > transaction.defaultDurability
                    }"
                    class="players-shops__transactions-item__item"
                    @click.exact="getItem(transaction.itemId)"
                    @click.ctrl="parseItemToChat(transaction.itemName)"
                >
                    <img :src="`${serverUrl}/dist/assets/images/items/${transaction.itemId}.gif`">
                    <span v-if="transaction.maxDurability"
                        class="players-shops__transactions-item__item__amount"
                    >
                        {{ transaction.durability }}/{{ transaction.maxDurability }}
                    </span>
                    <span v-else
                        class="players-shops__transactions-item__item__amount"
                    >{{ transaction.amount }}</span>
                </div>

                <div class="players-shops__transactions-item__info">
                    <template v-if="transaction.type === 'buy'">
                        <b>{{ $t('shop.boughtFrom') }}</b>: <a :href="`${serverUrl}/public/character/${transaction.clientName}`"
                            target="_blank"
                        >{{ transaction.clientName }}</a><br>
                        <b>{{ $t('shop.youPaid') }}</b>: {{ transaction.price + transaction.tax }}Z<br>
                        <b>{{ $t('shop.sellerReceived') }}</b>: {{ transaction.price }}Z<br>
                        <b>{{ $t('shop.tax') }}</b>: {{ transaction.tax }}Z<br>
                        <b>{{ $t('shop.soldWhen') }}</b>: {{ formatDate(transaction.date, 'dd MMM HH:mm:ss') }}
                    </template>
                    <template v-else>
                        <b>{{ $t('shop.soldTo') }}</b>: <a :href="`${serverUrl}/public/character/${transaction.clientName}`"
                            target="_blank"
                        >{{ transaction.clientName }}</a><br>
                        <b>{{ $t('shop.fullPrice') }}</b>: {{ transaction.price }}Z<br>
                        <b>{{ $t('shop.setPrice') }}</b>: {{ transaction.price - transaction.tax }}Z<br>
                        <b>{{ $t('shop.tax') }}</b>: {{ transaction.tax }}Z<br>
                        <b>{{ $t('shop.soldWhen') }}</b>: {{ formatDate(transaction.date, 'dd MMM HH:mm:ss') }}
                    </template>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';
import { format as dateFormat } from 'date-fns';

// Components
import loading from '@components/loading/loading.vue';

// Mixins
import chatMixin from '@mixins/chat.js';

export default {
    name: 'players-shops-buy-item',
    components: {
        loading
    },
    mixins: [chatMixin],
    data() {
        return {
            loading: true,
            transactions: [],
        };
    },
    computed: {
        ...mapGetters(['serverUrl']),
    },
    mounted() {
        mo.socket.on('getMyShopTransactionsComplete', (response) => {
            this.transactions = response;

            this.loading = false;
        });

        // Fetching transactions
        mo.socket.emit('getMyShopTransactions');
    },
    beforeDestroy() {
        mo.socket.off('getMyShopTransactionsComplete');
    },
    methods: {
        formatDate(date) {
            return dateFormat(new Date(date), 'dd MMM yy HH:mm:ss');
        },
        showItemInfo(itemId) {
            mo.socket.emit('getItemInfo', {
                itemId: itemId
            });
        },
        getItem(itemId) {
            mo.socket.emit('getItemInfo', {
                itemId: itemId
            });
        }
    }
};
</script>