<template>
    <div v-if="!loading"
        :class="$route.query.action"
        class="shop"
    >
        <div class="shop__tabs">
            <div class="shop__tabs__left">
                <div v-if="$route.query.action === 'sell'"
                    class="shop__tabs__header"
                >Items available to sell</div>
                <div v-else
                    class="shop__tabs__header"
                >Items available to buy</div>
            </div>

            <div class="shop__tabs__right">
                <div v-if="$route.query.action === 'sell'"
                    class="shop__tabs__header"
                >Selling items</div>
                <div v-else
                    class="shop__tabs__header"
                >Buying items</div>
            </div>
        </div>

        <div v-if="$route.query.action === 'sell' && $route.query.type === 'tools'"
            class="shop__top-bar"
        >
            <div class="shop__toggle">
                <div class="shop__toggle__value">
                    <label for="amountToggle">Toggle Item Amount</label>
                    <input id="amountToggle"
                        v-model="amountToggle"
                        type="checkbox"
                    >
                </div>
            </div>
        </div>

        <div :class="{'shop__wrapper--margin': $route.query.action === 'sell' && $route.query.type === 'tools'}"
            class="shop__wrapper shop__left"
        >
            <template v-if="itemsLeft.length">
                <div v-for="(item, index) in itemsLeft"
                    :key="index"
                    class="shop__item"
                >
                    <div class="shop__item__image-amount"
                        @click="showItemInfo(item.itemId)"
                    >
                        <img :src="`/dist/assets/images/items/${item.itemId}.gif`">
                        <span v-if="$route.query.action === 'sell'">{{ item.amount }}</span>
                    </div>
                    <div class="shop__item__name-price">
                        <div class="shop__item__name-price__name">{{ item.itemName }}</div>
                        <div class="shop__item__name-price__price">{{ item.price }} Z</div>
                    </div>
                    <div class="shop__item__move"
                        @click="moveItem(index, 'itemsLeft', 'itemsRight')"
                    >
                        &gt;
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="shop__empty">Empty</div>
            </template>
        </div>

        <div :class="{'shop__wrapper--margin': $route.query.action === 'sell' && $route.query.type === 'tools'}"
            class="shop__wrapper shop__right"
        >
            <template v-if="itemsRight.length">
                <div v-for="(item, index) in itemsRight"
                    :key="index"
                    class="shop__item"
                >
                    <div class="shop__item__image-amount">
                        <img :src="`/dist/assets/images/items/${item.itemId}.gif`">
                        <span>{{ item.amount }}</span>
                    </div>
                    <div class="shop__item__name-price">
                        <div class="shop__item__name-price__name">{{ item.itemName }}</div>
                        <div class="shop__item__name-price__price">{{ item.price }} Z</div>
                    </div>
                    <div class="shop__item__move"
                        @click="moveItem(index, 'itemsRight', 'itemsLeft')"
                    >
                        &lt;
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="shop__empty">Empty</div>
            </template>

            <div class="shop__summary">
                <div :class="{'shop__summary__value--not-enough': totalValue > characterZeny && $route.query.action === 'buy'}"
                    class="shop__summary__value"
                >
                    Total: {{ totalValue }} Z
                </div>
                <button v-if="$route.query.action === 'sell'"
                    :disabled="totalValue <= 0 || buttonLoading"
                    class="btn game-button"
                    @click="initiateSell()"
                >Sell</button>
                <button v-else
                    :disabled="!totalValue || totalValue > characterZeny || buttonLoading"
                    class="btn game-button"
                    @click="initiateBuy()"
                >Buy</button>
            </div>
        </div>

        <div v-if="displayAmountModal"
            class="modal"
        >
            <div class="modal__content shop__amount">
                <input ref="amountModal"
                    v-model="amountModal"
                    min="1"
                    :max="amountModalMax"
                    type="number"
                    size="4"
                    placeholder="Amount"
                >
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="displayAmountModal = false"
                >Cancel</button>
                <button :disabled="amountModal > amountModalMax || amountModal < 1"
                    class="btn game-button"
                    @click="confirmChosenAmount()"
                >GO</button>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Globals functions
import { functions } from '@src/functions.js';

const shopPage = {
    data() {
        return {
            loading: true,
            buttonLoading: false,
            itemsLeft: [],
            itemsRight: [],
            totalValue: 0,
            amountToggle: functions.storage('get', 'itemAmountToggle'),
            displayAmountModal: false,
            amountModal: 0,
            amountModalMax: 0,
            moveItemFoundIndex: null,
            moveFrom: null,
            moveTo: null
        };
    },
    computed: {
        ...mapGetters(['characterZeny'])
    },
    watch: {
        amountToggle() {
            functions.storage('set', 'itemAmountToggle', this.amountToggle);
        },
        amountModal() {
            if (this.amountModal > this.amountModalMax) {
                this.amountModal = this.amountModalMax;
            }
        }
    },
    mounted() {
        // Check if action is buy or seel
        if (!this.$route.query.action || !['buy', 'sell'].includes(this.$route.query.action)) {
            this.$router.push('/game');
        }

        // Check if type is correct
        if (!this.$route.query.type || !['equipment', 'tools'].includes(this.$route.query.type)) {
            this.$router.push('/game');
        }

        if (this.$route.query.action === 'buy') {
            mo.socket.emit('getShopItemsForBuy', this.$route.query.type);
        } else {
            mo.socket.emit('getUserItemsForSell', this.$route.query.type);
        }

        // Hiding chat
        this.$store.commit('showChat', false);

        mo.socket.on('getShopItemsForBuyComplete', (response) => {
            this.itemsLeft = response;
            this.loading = false;
        });

        mo.socket.on('getUserItemsForSellComplete', (response) => {
            this.itemsLeft = response;
            this.loading = false;
        });

        mo.socket.on('buyItemsComplete', (response) => {
            this.$store.commit('saveZeny', response.zeny);

            // Reset item lists and other variables
            this.itemsRight = [];
            this.totalValue = 0;

            this.buttonLoading = false;
        });

        mo.socket.on('sellItemsComplete', (response) => {
            this.$store.commit('saveZeny', response.zeny);

            // Reset item lists and other variables
            this.itemsRight = [];
            this.totalValue = 0;

            this.buttonLoading = false;
        });
    },
    beforeDestroy() {
        mo.socket.off('getShopItemsForBuyComplete');
        mo.socket.off('getUserItemsForSellComplete');
        mo.socket.off('buyItemsComplete');
        mo.socket.off('sellItemsComplete');

        // Showing chat
        this.$store.commit('showChat', true);
    },
    methods: {
        showItemInfo(itemId) {
            mo.socket.emit('getItemsInfo', [itemId]);
        },
        moveItem(index, moveFrom, moveTo) {
            const movingItem = this[moveFrom][index];

            this.moveFrom = moveFrom;
            this.moveTo = moveTo;

            // Checking if item is already in selling items array
            this.moveItemFoundIndex = this[moveTo].findIndex((item) => item.id === movingItem.id);

            // In case of buy, we always ask for amount
            if (this.$route.query.action === 'buy' && this.$route.query.type === 'tools') {
                this.toggledMovedItem = index;
                this.displayChoseAmount(index, movingItem);
            // In case toggle is off and there are more than 1 item, we check if we need to display amount popup
            } else if (movingItem.amount > 1 && !this.amountToggle) {
                this.toggledMovedItem = index;
                this.displayChoseAmount(index, movingItem);
            // Otherwise we move the whole batch
            } else {
                let movingItem = null;

                // In case it's not buy and not left items, we remove item from the list
                if (this.$route.query.action === 'buy' && this.$route.query.type === 'equipment' && this.moveFrom === 'itemsLeft') {
                    movingItem = { ...this[moveFrom][index] };
                } else {
                    movingItem = this[moveFrom].splice(index, 1)[0];
                }

                // Add to list of potentially bought/sold items
                // We first check if item that we suppose to move is already in the right list, if yes we need to just add amount
                if (this.$route.query.type === 'equipment') {
                    movingItem.amount = 1;
                    this[moveTo].push(movingItem);
                } else if (this.moveItemFoundIndex >= 0) {
                    this[moveTo][this.moveItemFoundIndex].amount += movingItem.amount;
                } else {
                    this[moveTo].push(movingItem);
                }

                this.calculateZenyValue();
            }
        },
        displayChoseAmount(index, movingItem) {
            this.displayAmountModal = true;
            this.amountModal = 1;
            this.amountModalMax = movingItem.amount;

            // Focus on field when it appears
            this.$nextTick(() => {
                this.$refs.amountModal.focus();
            });
        },
        confirmChosenAmount() {
            // In case user put it more than he should
            if (this.amountModal > this.amountModalMax || this.amountModal < 1) {
                return false;
            }

            const index = this.toggledMovedItem;
            const amount = Number(this.amountModal);

            //  Check if this is full amount, if that's the case we delete item from array fully
            if (this[this.moveFrom][index].amount === amount) {
                let movingItem = null;

                // In case of window of buy we never remove item from itemsLeft
                if (this.$route.query.action === 'buy' && this.moveFrom === 'itemsLeft') {
                    movingItem = this[this.moveFrom][index];
                } else {
                    movingItem = this[this.moveFrom].splice(index, 1)[0];
                }

                if (this.moveItemFoundIndex >= 0) {
                    this[this.moveTo][this.moveItemFoundIndex].amount += movingItem.amount;
                } else {
                    this[this.moveTo].push(movingItem);
                }
            // In case if not, we only deducting part of it
            } else {
                const movingItem = { ...this[this.moveFrom][index] };

                movingItem.amount = amount;
                // In case of window of sale, we decrease the amount of leftItems
                if (this.$route.query.action === 'sell' || (this.$route.query.action === 'buy' && this.moveFrom === 'itemsRight')) {
                    this[this.moveFrom][index].amount -= amount;
                }

                if (this.moveItemFoundIndex >= 0) {
                    this[this.moveTo][this.moveItemFoundIndex].amount += movingItem.amount;
                } else {
                    this[this.moveTo].push(movingItem);
                }
            }

            this.calculateZenyValue();

            this.displayAmountModal = false;
        },
        calculateZenyValue() {
            let value = 0;

            // Calculate value from all "right" items
            for (const item of this.itemsRight) {
                value += item.price * item.amount;
            }

            this.totalValue = value;
        },
        initiateBuy() {
            this.buttonLoading = true;

            mo.socket.emit('buyItems', {
                type: this.$route.query.type,
                items: this.itemsRight
            });
        },
        initiateSell() {
            this.buttonLoading = true;

            mo.socket.emit('sellItems', this.itemsRight);
        }
    }
};

// Routing
mo.routes.push({
    path: '/shop',
    component: shopPage
});

export default shopPage;
</script>