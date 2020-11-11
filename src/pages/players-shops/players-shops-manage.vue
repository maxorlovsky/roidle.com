<template>
    <section class="players-shops">
        <div v-if="loading"
            class="players-shops__wrapper"
        >
            <loading />
        </div>
        <div v-else
            class="players-shops__wrapper"
        >
            <div class="players-shops__shop">
                <div class="players-shops__title">Manage Shop</div>
                <div class="players-shops__shop-title">{{ shopName }}</div>

                <div class="players-shops__form-element players-shops__form-border">
                    <div class="form-heading">Shop Description:</div>
                    <input v-model="shopDescription"
                        type="text"
                        placeholder="Shop Description"
                        maxlength="150"
                    >
                </div>

                <div class="players-shops__form-element players-shops__form-border">
                    <div class="form-heading">Rent price per day: <b>{{ currentPricePerDay }}Z</b></div>
                </div>

                <div class="players-shops__form-element players-shops__form-border">
                    <div class="form-heading">Zeny in cashbox: <b>{{ shopCashboxAmount }}Z</b></div>
                    <div class="players-shops__cashbox">
                        <button class="btn game-button players-shops__cashbox__button"
                            @click="cashBox('deposit')"
                        >
                            Add zeny to cashbox
                        </button>
                        <button class="btn game-button players-shops__cashbox__button"
                            @click="cashBox('withdraw')"
                        >
                            Take zeny from cashbox
                        </button>
                    </div>
                </div>

                <div class="players-shops__form-element players-shops__form-border">
                    <div>You can specify in what amount of days your shop should close. Leave it at <b>0</b> if it should be indefinite or until all items are sold.</div>
                    <div class="form-heading">In what amout of days shop will close:</div>
                    <input v-model="days"
                        type="number"
                        min="0"
                        :max="maxDays"
                        placeholder="In what amout of days shop will close"
                    >
                </div>

                <div v-if="errorMessage"
                    :class="{'players-shops__error--visible': errorMessage}"
                    class="players-shops__error"
                    v-html="errorMessage"
                />

                <button :disabled="buttonLoading"
                    class="btn game-button players-shops__shop__open"
                    @click="updateShop()"
                >Update</button>
            </div>

            <div class="players-shops__inventory-wrapper">
                <div class="players-shops__title">Inventory</div>

                <template v-if="temporaryInventory.length">
                    <div v-for="(item, index) in temporaryInventory"
                        :key="index"
                        :class="{
                            'players-shops__inventory-wrapper__item--broken': item.broken,
                            'players-shops__inventory-wrapper__item--not-pristine': item.defaultDurability && item.durability < item.defaultDurability,
                            'players-shops__inventory-wrapper__item--high-quality': item.durability && item.durability > item.defaultDurability
                        }"
                        class="players-shops__inventory-wrapper__item"
                        @click="addItemToShop(item)"
                    >
                        <img :src="`/dist/assets/images/items/${item.itemId}.gif`">
                        <span v-if="item.maxDurability"
                            class="inventory__item__amount"
                        >
                            {{ item.durability }}/{{ item.maxDurability }}
                        </span>
                        <span v-else
                            class="inventory__item__amount"
                        >{{ item.amount }}</span>
                    </div>
                </template>
                <template v-else>
                    <div class="players-shops__inventory-wrapper__empty">Empty</div>
                </template>
            </div>

            <div class="players-shops__sold-items-wrapper">
                <div class="players-shops__title">Items on counter</div>

                <p>{{ characterLocation }}'s tax for item selling is <b>{{ locationTax }}%</b></p>

                <template v-if="shopItems.length">
                    <div v-for="(item, index) in shopItems"
                        :key="index"
                        class="players-shops__sold-item"
                    >
                        <div :class="{
                            'players-shops__sold-item__image-amount--broken': item.broken,
                            'players-shops__sold-item__image-amount--not-pristine': item.defaultDurability && item.durability < item.defaultDurability,
                            'players-shops__sold-item__image-amount--high-quality': item.durability && item.durability > item.defaultDurability
                        }"
                            class="players-shops__sold-item__image-amount"
                            @click="showItemInfo(item)"
                        >
                            <img :src="`/dist/assets/images/items/${item.itemId}.gif`">
                            <span v-if="item.maxDurability">{{ item.durability }}/{{ item.maxDurability }}</span>
                            <span v-else>{{ item.amount }}</span>
                        </div>
                        <div class="players-shops__sold-item__name-price">
                            <div class="players-shops__sold-item__name-price__name">{{ item.itemName }}</div>
                            <div class="players-shops__sold-item__name-price__price">End Price: {{ Math.floor(Number(item.price) + (Number(item.price) * (locationTax / 100))) }} Z</div>
                        </div>
                        <div class="players-shops__sold-item__set-price">
                            Your price<br>
                            <input v-model="item.price"
                                :disabled="buttonLoading"
                                type="number"
                                min="1"
                                :max="maxCashboxAmount"
                                @blur="changePrice(item)"
                            >
                        </div>
                        <div :class="{ 'players-shops__sold-item__move--disabled': buttonLoading }"
                            class="players-shops__sold-item__move"
                            @click="takeBackItem(item)"
                        >
                            &lt;
                        </div>
                    </div>
                </template>
                <template v-else>
                    <div class="players-shops__sold-items-wrapper__empty">Empty</div>
                </template>
            </div>
        </div>

        <div v-if="displayCashboxAmountModal"
            class="modal"
        >
            <div class="modal__content players-shops__amount">
                <input ref="cashboxAmount"
                    v-model="cashboxAmount"
                    min="0"
                    :max="maxCashboxAmount"
                    type="number"
                    size="10"
                    placeholder="Amount"
                >
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="closeCashbox()"
                >Cancel</button>
                <button :disabled="cashboxAmount < 1 || cashboxAmount > maxCashboxAmount || buttonLoading"
                    class="btn game-button"
                    @click="confirmCashboxUpdate()"
                >Confirm</button>
            </div>
        </div>

        <div v-if="displayItemAmountModal"
            class="modal"
        >
            <div class="modal__content players-shops__amount">
                <div v-if="displayItemAmountProperty">
                    <div class="form-heading">Amount:</div>
                    <input ref="itemAmountValue"
                        v-model="itemAmountValue"
                        min="0"
                        :max="itemAmountMax"
                        type="number"
                        size="9"
                        placeholder="Amount"
                    >
                </div>

                <div v-if="displayItemZenyProperty">
                    <div class="form-heading">Zeny price per item:</div>
                    <input ref="itemAmountPrice"
                        v-model="itemAmountPrice"
                        min="0"
                        :max="maxCashboxAmount"
                        type="number"
                        size="9"
                        placeholder="Price"
                    >
                </div>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="closeItemAmountModal()"
                >Cancel</button>
                <button :disabled="(displayItemAmountProperty && (itemAmountValue < 1 || itemAmountValue > itemAmountMax)) ||
                    (displayItemZenyProperty && itemAmountPrice < 1) ||
                    buttonLoading"
                    class="btn game-button"
                    @click="confirmItemSell()"
                >Confirm</button>
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import loading from '@components/loading/loading.vue';

const managePlayersShopPage = {
    components: {
        loading,
    },
    data() {
        return {
            loading: true,
            buttonLoading: false,
            temporaryInventory: [],
            displayCashboxAmountModal: false,
            cashboxAmount: 0,
            cashboxDeposit: false,
            maxCashboxAmount: 2000000,
            currentPricePerDay: 0,
            shopCashboxAmount: 0,
            shopName: '',
            shopDescription: '',
            days: '0',
            maxDays: 90,
            errorMessage: '',
            displayItemAmountModal: false,
            displayItemAmountProperty: false,
            displayItemZenyProperty: false,
            itemAmountValue: 0,
            itemAmountMax: 0,
            itemAmountPrice: 0,
            transferItem: null,
            locationTax: 0,
            shopItems: []
        };
    },
    computed: {
        ...mapGetters([
            'characterLocation',
            'inventory'
        ])
    },
    watch: {
        itemAmountPrice() {
            let amount = Number(this.itemAmountPrice);

            if (amount < 0) {
                amount = 0;
            }

            this.itemAmountPrice = amount;
        },
        itemAmountValue() {
            let amount = Number(this.itemAmountValue);

            if (amount < 0) {
                amount = 0;
            } else if (amount > Number(this.itemAmountMax)) {
                amount = Number(this.itemAmountMax);
            }

            this.itemAmountValue = amount;
        },
        cashboxAmount() {
            let amount = Number(this.cashboxAmount);

            if (amount < 0) {
                amount = 0;
            } else if (amount > Number(this.maxCashboxAmount)) {
                amount = Number(this.maxCashboxAmount);
            }

            this.cashboxAmount = amount;
        },
        days() {
            let amount = Number(this.days);

            if (amount > this.maxDays) {
                amount = this.maxDays;
            }

            this.days = amount;
        }
    },
    mounted() {
        // Put user inventory into temporary one, since it's going to be manipulated
        this.temporaryInventory = [...this.inventory];

        mo.socket.on('shopTakeItemFromShopComplete', () => {
            this.buttonLoading = false;

            // Update temporary inventory
            this.temporaryInventory = [...this.inventory];

            // Requesting shop data reset
            mo.socket.emit('getMyShop');
        });

        mo.socket.on('shopUpdateItemPriceComplete', () => {
            this.buttonLoading = false;
        });

        mo.socket.on('shopPlaceSellItemComplete', (response) => {
            this.buttonLoading = false;

            // In case response is true, we can close modal
            if (response) {
                // Close modal
                this.closeItemAmountModal();

                // Update temporary inventory
                this.temporaryInventory = [...this.inventory];

                // Requesting shop data reset
                mo.socket.emit('getMyShop');
            }
        });

        mo.socket.on('getMyShopComplete', (response) => {
            // If response is false, meaning that shop does not exist in this case system message must be sent to the user
            if (!response) {
                // In this case we redirect user to the list of shop
                this.$router.push('/players-shops');
            }

            this.shopName = response.name;
            this.shopDescription = response.description;
            this.shopCashboxAmount = response.cashbox;
            this.days = response.days;
            this.shopItems = response.items;

            this.loading = false;
        });

        mo.socket.on('updateShopComplete', (response) => {
            if (response.status) {
                this.errorMessage = '';
            } else {
                this.errorMessage = response.message;
            }

            this.buttonLoading = false;
        });

        mo.socket.on('shopCashboxOperationComplete', (response) => {
            this.buttonLoading = false;

            // In case response is numberic and not "false" then we need to update cashbox amount
            if (response >= 0) {
                this.shopCashboxAmount = response || 0;
                // In case of success we also close modal window
                this.closeCashbox();
            }
        });

        mo.socket.on('getLocationVendingPriceComplete', (response) => {
            this.currentPricePerDay = response.pricePerDay;
            this.locationTax = response.locationVendingTax;
        });

        mo.socket.emit('getLocationVendingPrice');
        mo.socket.emit('getMyShop');
    },
    beforeDestroy() {
        mo.socket.off('shopTakeItemFromShopComplete');
        mo.socket.off('shopUpdateItemPriceComplete');
        mo.socket.off('shopPlaceSellItemComplete');
        mo.socket.off('getMyShopComplete');
        mo.socket.off('updateShopComplete');
        mo.socket.off('shopCashboxOperationComplete');
        mo.socket.off('getLocationVendingPriceComplete');
    },
    methods: {
        takeBackItem(item) {
            // In case some loading is in progress we ignore click on this item
            if (this.buttonLoading) {
                return false;
            }

            this.buttonLoading = true;

            mo.socket.emit('shopTakeItemFromShop', item.id);
        },
        showItemInfo(item) {
            mo.socket.emit('getItemInfo', {
                itemId: item.itemId,
                shopItemId: item.id
            });
        },
        changePrice(item) {
            this.buttonLoading = true;

            mo.socket.emit('shopUpdateItemPrice', item);
        },
        confirmItemSell() {
            this.buttonLoading = true;

            mo.socket.emit('shopPlaceSellItem', {
                item: this.transferItem,
                amount: this.itemAmountValue,
                price: this.itemAmountPrice
            });
        },
        closeItemAmountModal() {
            this.displayItemAmountModal = false;
            this.displayItemAmountProperty = false;
            this.displayItemZenyProperty = false;
            this.transferItem = null;
        },
        addItemToShop(item) {
            // Closing other modal first
            this.closeCashbox();

            this.displayItemAmountModal = true;

            // Detect if item can be of multiple amounts
            if (item.amount > 1) {
                this.displayItemAmountProperty = true;
            } else {
                this.displayItemAmountProperty = false;
            }

            // We're trying to detect if such item is already in the list, in this case zeny propery should be ignorred and hidden
            const findItem = this.shopItems.find((findItem) => findItem.itemId === item.itemId && !findItem.maxDurability);

            // If item found, we hide zeny property
            if (findItem) {
                this.displayItemZenyProperty = false;
            } else {
                this.displayItemZenyProperty = true;
            }

            this.itemAmountValue = item.amount;
            this.itemAmountMax = item.amount;

            this.transferItem = item;

            // In case we don't need to display zeny, means that item is already in the list of selling items
            // We also check if the amount of item that we're trying to add is just one, in this case we don't really need to display modal and can proceed with submit
            if (!this.displayItemZenyProperty && item.amount <= 1) {
                this.displayItemAmountModal = false;
                this.confirmItemSell();
            }
        },
        updateShop() {
            this.buttonLoading = true;

            mo.socket.emit('updateShop', {
                description: this.shopDescription,
                days: this.days
            });
        },
        closeCashbox() {
            this.displayCashboxAmountModal = false;
            this.cashboxAmount = 0;
        },
        confirmCashboxUpdate() {
            this.buttonLoading = true;

            mo.socket.emit('shopCashboxOperation', {
                deposit: this.cashboxDeposit,
                amount: this.cashboxAmount
            });
        },
        cashBox(deposit) {
            // Close other modal first
            this.closeItemAmountModal();

            if (deposit === 'deposit') {
                this.cashboxDeposit = true;

                this.maxCashboxAmount = 2000000;
            } else {
                this.cashboxDeposit = false;

                this.maxCashboxAmount = this.shopCashboxAmount;
            }

            this.displayCashboxAmountModal = true;
        }
    }
};

// Routing
mo.routes.push({
    path: '/players-shops/manage/:id',
    component: managePlayersShopPage
});

export default managePlayersShopPage;
</script>