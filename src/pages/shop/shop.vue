<template>
    <div v-if="!loading"
        :class="$route.query.action"
        class="shop"
    >
        <div class="shop__tabs">
            <div class="shop__tabs__left">
                <div v-if="$route.query.action === 'sell'"
                    class="shop__tabs__header"
                >{{ $t('shop.itemsAvailableToSell') }}</div>
                <div v-else
                    class="shop__tabs__header"
                >{{ $t('shop.itemsAvailableToBuy') }}</div>
            </div>

            <div class="shop__tabs__right">
                <div v-if="$route.query.action === 'sell'"
                    class="shop__tabs__header"
                >{{ $t('shop.sellingItems') }}</div>
                <div v-else
                    class="shop__tabs__header"
                >{{ $t('shop.buyingItems') }}</div>
            </div>
        </div>

        <div v-if="$route.query.action === 'sell' && $route.query.type === 'tools'"
            class="shop__top-bar"
        >
            <div class="shop__toggle">
                <div class="shop__toggle__value">
                    <label for="amountToggle">{{ $t('shop.toggleItemAmount') }}</label>
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
            <div class="search-input">
                <input v-model="search"
                    :placeholder="$t('global.search')"
                    maxlength="50"
                    type="text"
                >
                <div v-show="search"
                    class="search-input__close"
                    @click="search = ''"
                >X</div>
            </div>

            <template v-if="itemsLeft.length">
                <div v-for="(item, index) in filteredItems"
                    :key="index"
                    class="shop__item"
                >
                    <div :class="{
                        'shop__item__image-amount--broken': item.broken,
                        'shop__item__image-amount--not-pristine': item.defaultDurability && item.durability < item.defaultDurability,
                        'shop__item__image-amount--high-quality': item.durability && item.durability > item.defaultDurability
                    }"
                        class="shop__item__image-amount"
                        @click.exact="showItemInfo(item)"
                        @click.ctrl="parseItemToChat(item.itemName)"
                    >
                        <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                        <span v-if="item.maxDurability">{{ item.durability }}/{{ item.maxDurability }}</span>
                        <span v-else-if="$route.query.action === 'sell'">{{ item.amount }}</span>
                    </div>
                    <div class="shop__item__name-price">
                        <div class="shop__item__name-price__name">{{ item.itemName }} <template v-if="item.refined">+{{ item.refined }}</template></div>
                        <div class="shop__item__name-price__price">{{ item.price }} Z</div>
                    </div>
                    <div class="shop__item__move"
                        @click="moveItem(item, 'itemsLeft', 'itemsRight')"
                    >
                        &gt;
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="shop__empty">{{ $t('global.empty') }}</div>
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
                    <div :class="{
                            'shop__item__image-amount--broken': item.broken,
                            'shop__item__image-amount--not-pristine': item.defaultDurability && item.durability < item.defaultDurability,
                            'shop__item__image-amount--high-quality': item.durability && item.durability > item.defaultDurability
                        }"
                        class="shop__item__image-amount"
                    >
                        <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                        <span v-if="item.maxDurability">{{ item.durability }}/{{ item.maxDurability }}</span>
                        <span v-else>{{ item.amount }}</span>
                    </div>
                    <div class="shop__item__name-price">
                        <div class="shop__item__name-price__name">{{ item.itemName }} <template v-if="item.refined">+{{ item.refined }}</template></div>
                        <div class="shop__item__name-price__price">{{ item.price }} Z</div>
                    </div>
                    <div class="shop__item__move"
                        @click="moveItem(item, 'itemsRight', 'itemsLeft')"
                    >
                        &lt;
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="shop__empty">{{ $t('global.empty') }}</div>
            </template>

            <div class="shop__summary">
                <div :class="{'shop__summary__value--not-enough': totalValue > characterZeny && $route.query.action === 'buy'}"
                    class="shop__summary__value"
                >
                    {{ $t('shop.total') }}: {{ totalValue }} Z
                </div>
                <button v-if="$route.query.action === 'sell'"
                    :disabled="totalValue <= 0 || buttonLoading"
                    class="btn game-button"
                    @click="initiateSell()"
                >{{ $t('shop.sell') }}</button>
                <button v-else
                    :disabled="!totalValue || totalValue > characterZeny || buttonLoading"
                    class="btn game-button"
                    @click="initiateBuy()"
                >{{ $t('shop.buy') }}</button>
            </div>
        </div>

        <div v-if="displayAmountModal"
            class="modal"
        >
            <div class="modal__content shop__amount">
                <input ref="amountModal"
                    v-model="amountModal"
                    :placeholder="$t('global.amount')"
                    min="1"
                    :max="amountModalMax"
                    type="number"
                    size="4"
                >
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="displayAmountModal = false"
                >{{ $t('global.cancel') }}</button>
                <button :disabled="amountModal > amountModalMax || amountModal < 1"
                    class="btn game-button"
                    @click="confirmChosenAmount()"
                >{{ $t('shop.go') }}</button>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Utilities
import { functions } from '@utils/functions.js';

// Mixins
import chatMixin from '@mixins/chat.js';

const shopPage = {
    mixins: [chatMixin],
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
            moveTo: null,
            search: ''
        };
    },
    computed: {
        ...mapGetters([
            'characterZeny',
            'serverUrl'
        ]),

        filteredItems() {
            let inv = this.itemsLeft;

            if (this.search) {
                inv = inv.filter((item) => item.itemName.toLowerCase().indexOf(this.search.toLowerCase()) > -1);
            }

            return inv || [];
        }
    },
    watch: {
        amountToggle() {
            functions.storage('set', 'itemAmountToggle', this.amountToggle);
        },
        amountModal() {
            if (this.amountModal > this.amountModalMax) {
                this.amountModal = this.amountModalMax;
            }

            this.amountModal = Math.floor(this.amountModal);
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

        mo.socket.on('getShopItemsForBuyComplete', (response) => {
            this.itemsLeft = response;
            this.loading = false;
        });

        mo.socket.on('getUserItemsForSellComplete', (response) => {
            this.itemsLeft = response;
            this.loading = false;
        });

        mo.socket.on('buyItemsComplete', () => {
            // Reset item lists and other variables
            this.itemsRight = [];
            this.totalValue = 0;

            this.buttonLoading = false;
        });

        mo.socket.on('sellItemsComplete', () => {
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
    },
    methods: {
        showItemInfo(item) {
            const params = {
                itemId: item.itemId
            };

            // In case of sell, we will add item ID to display if it's broken or not and what's it durability
            if (this.$route.query.action === 'sell' && this.$route.query.type === 'equipment' && item.id) {
                params.inventoryId = item.id;
            }

            mo.socket.emit('getItemInfo', params);
        },
        moveItem(item, moveFrom, moveTo) {
            const index = this[moveFrom].findIndex((findItem) => findItem.itemId === item.itemId &&
                findItem.durability === item.durability &&
                findItem.maxDurability === item.maxDurability);
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