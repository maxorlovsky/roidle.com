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
            <div class="players-shops__view-wrapper">
                <div class="players-shops__title">{{ $t('shop.insideTheShop') }}</div>
                <div class="players-shops__shop-title">"{{ shopName }}"</div>
            </div>

            <div class="players-shops__sold-items-wrapper">
                <div class="players-shops__title">{{ $t('shop.itemsOnCounter') }}</div>

                <div class="players-shops__top">
                    <div class="search-input">
                        <input v-model="searchSell"
                            :placeholder="$t('global.search')"
                            maxlength="50"
                            type="text"
                        >
                        <div v-show="searchSell"
                            class="search-input__close"
                            @click="searchSell = ''"
                        >X</div>
                    </div>

                    <div class="players-shops__top__sorting">
                        <div class="players-shops__top__sorting__label">{{ $t('global.show') }}:</div>
                        <select v-model="sortSellBy">
                            <option value="all">{{ $t('global.all') }}</option>
                            <option value="consumables">{{ $t('global.consumables') }}</option>
                            <option value="equipment">{{ $t('global.equipment') }}</option>
                            <option value="etc">{{ $t('global.etc') }}</option>
                        </select>
                    </div>
                </div>

                <template v-if="filteredSellItems.length">
                    <div v-for="(item, index) in filteredSellItems"
                        :key="index"
                        class="players-shops__sold-item players-shops__view-shop"
                    >
                        <div :class="{
                            'players-shops__sold-item__image-amount--broken': item.broken,
                            'players-shops__sold-item__image-amount--not-pristine': item.defaultDurability && item.durability < item.defaultDurability,
                            'players-shops__sold-item__image-amount--high-quality': item.durability && item.durability > item.defaultDurability
                        }"
                            class="players-shops__sold-item__image-amount"
                            @click.exact="showItemInfo(item)"
                            @click.ctrl="parseItemToChat(item.itemName)"
                        >
                            <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                            <span v-if="item.maxDurability">{{ item.durability }}/{{ item.maxDurability }}</span>
                            <span v-else>{{ item.amount }}</span>
                        </div>
                        <div class="players-shops__sold-item__name-price">
                            <div class="players-shops__sold-item__name-price__name">{{ item.itemName }}</div>
                            <div class="players-shops__sold-item__name-price__price">{{ $t('shop.price') }}:
                                <span :class="{ 'players-shops__sold-item__name-price__price--not-enough': characterZeny < item.price }">{{ item.price }} Z</span>
                            </div>
                        </div>
                        <div :class="{ 'players-shops__sold-item__move--disabled': buttonLoading || characterZeny < item.price }"
                            class="players-shops__sold-item__move"
                            @click="buyItem(item)"
                        >
                            &gt;
                        </div>
                    </div>
                </template>
                <template v-else>
                    <div class="players-shops__sold-items-wrapper__empty">{{ $t('global.empty') }}</div>
                </template>
            </div>

            <div class="players-shops__buy">
                <div class="players-shops__title">{{ $t('shop.willingToBuy') }}</div>

                <div class="players-shops__top">
                    <div class="search-input">
                        <input v-model="searchBuy"
                            :placeholder="$t('global.search')"
                            maxlength="50"
                            type="text"
                        >
                        <div v-show="searchBuy"
                            class="search-input__close"
                            @click="searchBuy = ''"
                        >X</div>
                    </div>

                    <div class="players-shops__top__sorting">
                        <div class="players-shops__top__sorting__label">{{ $t('global.show') }}:</div>
                        <select v-model="sortBuyBy">
                            <option value="all">{{ $t('global.all') }}</option>
                            <option value="consumables">{{ $t('global.consumables') }}</option>
                            <option value="equipment">{{ $t('global.equipment') }}</option>
                            <option value="etc">{{ $t('global.etc') }}</option>
                        </select>
                    </div>
                </div>

                <template v-if="filteredBuyItems.length">
                    <div v-for="(item, index) in filteredBuyItems"
                        :key="index"
                        class="players-shops__sold-item players-shops__view-shop"
                    >
                        <div class="players-shops__sold-item__image-amount"
                            @click.exact="getItem(item)"
                            @click.ctrl="parseItemToChat(item.itemName)"
                        >
                            <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                            <span>{{ item.amount }}</span>
                        </div>
                        <div class="players-shops__sold-item__name-price">
                            <div class="players-shops__sold-item__name-price__name">{{ item.itemName }}</div>
                            <div v-if="item.maxDurability"
                                class="players-shops__buy-item__name-price__durability"
                            >
                                {{ $t('shop.buyDurabilityRange') }}: {{ item.durability }} - {{ item.maxDurability }}
                            </div>
                            <div class="players-shops__sold-item__name-price__price">{{ $t('shop.buyPricePerItem') }}:
                                <span>{{ item.price }} Z</span>
                            </div>
                        </div>
                        <div :class="{ 'players-shops__sold-item__move--disabled': buttonLoading || !ifCanSell(item) }"
                            class="players-shops__sold-item__move"
                            @click="sellItem(item)"
                        >
                            &gt;
                        </div>
                    </div>
                </template>
                <template v-else>
                    <div class="players-shops__sold-items-wrapper__empty">{{ $t('global.empty') }}</div>
                </template>
            </div>
        </div>

        <div v-if="displayItemAmountModal"
            class="modal"
        >
            <div class="modal__content players-shops__amount">
                <template v-if="buyingItem">
                    <input v-if="buyingItem.amount > 1"
                        ref="itemAmountValue"
                        v-model="itemAmountValue"
                        :placeholder="$t('global.amount')"
                        min="1"
                        :max="itemAmountMax"
                        type="number"
                        size="9"
                    >
                    <b>{{ buyingItem.itemName }} <template v-if="buyingItem.defaultDurability">({{ buyingItem.durability }} / {{ buyingItem.maxDurability }})</template></b>
                    <p>{{ $t('shop.fullPrice') }}: <b :class="{ 'players-shops__amount__zeny--not-enough': characterZeny < buyingItem.price * itemAmountValue }">{{ buyingItem.price * itemAmountValue }}Z</b></p>
                </template>
                <template v-else>
                    <b>{{ $t('shop.youAboutToSell' ) }}!!!</b>

                    <div class="players-shops__selling-items">
                        <div v-for="(item, index) in sellingItems"
                            :key="index"
                            :class="{'players-shops__selling-items__item--selected': index === selectedSellingItem}"
                            class="players-shops__selling-items__item"
                            @click="selectSellingItem(item, index)"
                        >
                            <item-block :item="item"
                                :show-item-info="false"
                            />
                        </div>
                    </div>

                    <input v-if="itemAmountMax > 1"
                        ref="itemAmountValue"
                        v-model="itemAmountValue"
                        :placeholder="$t('global.amount')"
                        min="1"
                        :max="itemAmountMax"
                        type="number"
                        size="9"
                    >

                    <p>{{ $t('shop.youReceive') }}: <b>{{ sellingItemPrice * itemAmountValue }}Z</b></p>
                </template>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="closeItemAmountModal()"
                >{{ $t('global.cancel') }}</button>
                <button v-if="buyingItem"
                    :disabled="itemAmountValue < 1 || itemAmountValue > itemAmountMax || buttonLoading || characterZeny < buyingItem.price * itemAmountValue"
                    class="btn game-button"
                    @click="confirmBuy()"
                >{{ $t('shop.confirm') }}</button>
                <button v-else
                    :disabled="itemAmountValue < 1 || itemAmountValue > itemAmountMax || buttonLoading"
                    class="btn game-button"
                    @click="confirmSell()"
                >{{ $t('shop.confirm') }}</button>
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import loading from '@components/loading/loading.vue';
import itemBlock from '@components/item-block/item-block.vue';

// Utils
import { sort as inventorySort } from '@utils/inventory.js';

// Mixins
import chatMixin from '@mixins/chat.js';

const viewPlayersShopPage = {
    components: {
        loading,
        itemBlock
    },
    mixins: [chatMixin],
    data() {
        return {
            loading: true,
            buttonLoading: false,
            shopId: 0,
            shopName: '',
            shopItems: [],
            shopItemsBuy: [],
            displayItemAmountModal: false,
            itemAmountValue: 1,
            itemAmountMax: 1,
            buyingItem: null,
            searchSell: '',
            sortSellBy: 'all',
            sellingItems: [],
            searchBuy: '',
            sortBuyBy: 'all',
            sellingItem: null,
            sellingItemShopId: 0,
            sellingItemPrice: 0,
            selectedSellingItem: 0
        };
    },
    computed: {
        ...mapGetters([
            'characterZeny',
            'inventory',
            'serverUrl'
        ]),

        filteredSellItems() {
            let inv = this.shopItems;

            if (this.searchSell) {
                inv = inv.filter((item) => item.itemName.toLowerCase().indexOf(this.searchSell.toLowerCase()) > -1);
            }

            inv = inventorySort(inv, this.sortSellBy);

            return inv || [];
        },
        filteredBuyItems() {
            let inv = this.shopItemsBuy;

            if (this.searchBuy) {
                inv = inv.filter((item) => item.itemName.toLowerCase().indexOf(this.searchBuy.toLowerCase()) > -1);
            }

            inv = inventorySort(inv, this.sortBuyBy);

            return inv || [];
        }
    },
    watch: {
        itemAmountValue() {
            let amount = Number(this.itemAmountValue);

            if (amount < 1) {
                amount = 1;
            } else if (amount > this.itemAmountMax) {
                amount = this.itemAmountMax;
            }

            this.itemAmountValue = amount;
        }
    },
    mounted() {
        if (!this.$route.params.id) {
            // In this case we redirect user to the list of shop
            this.$router.go(-1);
        }

        mo.socket.on('shopSellItemComplete', (response) => {
            this.buttonLoading = false;

            // In case response is true, we can close modal
            if (response) {
                // Close modal
                this.closeItemAmountModal();

                // Requesting shop data reset
                mo.socket.emit('getShop', this.$route.params.id);
            }
        });

        mo.socket.on('shopBuyItemComplete', (response) => {
            this.buttonLoading = false;

            // In case response is true, we can close modal
            if (response) {
                // Close modal
                this.closeItemAmountModal();

                // Requesting shop data reset
                mo.socket.emit('getShop', this.$route.params.id);
            }
        });

        mo.socket.on('getShopComplete', (response) => {
            // If response is false, meaning that shop does not exist in this case system message must be sent to the user
            if (!response) {
                // In this case we redirect user to the list of shop
                this.$router.go(-1);
            }

            this.shopId = response.id;
            this.shopName = response.name;
            this.shopItems = response.items;
            this.shopItemsBuy = response.itemsToBuy;

            this.loading = false;
        });

        mo.socket.emit('getShop', this.$route.params.id);
    },
    beforeDestroy() {
        mo.socket.off('shopSellItemComplete');
        mo.socket.off('shopBuyItemComplete');
        mo.socket.off('getShopComplete');
    },
    methods: {
        confirmSell() {
            if (this.buttonLoading) {
                return false;
            }

            this.buttonLoading = true;

            mo.socket.emit('shopSellItem', {
                shopId: this.shopId,
                shopItemId: this.sellingItemShopId,
                item: this.sellingItem,
                amount: this.itemAmountValue,
                price: this.sellingItemPrice * this.itemAmountValue
            });
        },
        selectSellingItem(item, index) {
            this.sellingItem = item;
            this.selectedSellingItem = index;
        },
        ifCanSell(item) {
            const haveAvailableItems = this.inventory.find((inventoryItem) => inventoryItem.itemId === item.itemId &&
                // Minimum required max.durability
                inventoryItem.maxDurability >= item.durability &&
                // Maximum required max.durability
                inventoryItem.maxDurability <= item.maxDurability &&
                // And make sure that item is repaired
                inventoryItem.maxDurability === inventoryItem.durability);

            if (haveAvailableItems) {
                return true;
            }

            return false;
        },
        sellItem(sellingItem) {
            if (this.buttonLoading) {
                return false;
            }

            const findItems = this.inventory.filter((inventoryItem) => inventoryItem.itemId === sellingItem.itemId &&
                // Minimum required max.durability
                inventoryItem.maxDurability >= sellingItem.durability &&
                // Maximum required max.durability
                inventoryItem.maxDurability <= sellingItem.maxDurability &&
                // And make sure that item is repaired
                inventoryItem.maxDurability === inventoryItem.durability);

            // Check if at least one item was found
            if (!findItems.length) {
                return false;
            }

            this.displayItemAmountModal = true;

            this.itemAmountValue = sellingItem.amount;
            this.sellingItemPrice = sellingItem.price;
            this.sellingItemShopId = sellingItem.id;

            // In case it's weapon or armor, always default to 1
            if (sellingItem.type === 'weapon' || sellingItem.type === 'armor') {
                this.itemAmountMax = 1;
            } else if (sellingItem.amount < findItems[0].amount) {
                this.itemAmountMax = sellingItem.amount;
            } else {
                this.itemAmountMax = findItems[0].amount;
            }

            // Pre-selecting the very first item
            this.selectSellingItem(findItems[0], 0);

            this.sellingItems = findItems;
        },
        getItem(item) {
            mo.socket.emit('getItemInfo', {
                itemId: item.itemId
            });
        },
        showItemInfo(item) {
            mo.socket.emit('getItemInfo', {
                itemId: item.itemId,
                shopItemId: item.id
            });
        },
        confirmBuy() {
            if (this.buttonLoading) {
                return false;
            }

            this.buttonLoading = true;

            mo.socket.emit('shopBuyItem', {
                shopId: this.shopId,
                shopItemId: this.buyingItem.id,
                amount: this.itemAmountValue,
                price: this.buyingItem.price * this.itemAmountValue
            });
        },
        closeItemAmountModal() {
            this.displayItemAmountModal = false;
            this.itemAmountValue = 1;
            this.itemAmountMax = 1;
            this.buyingItem = null;
            this.sellingItems = [];
            this.sellingItemPrice = 0;
            this.sellingItem = null;
            this.selectedSellingItem = 0;
            this.sellingItemShopId = 0;
        },
        buyItem(item) {
            if (this.buttonLoading || this.characterZeny < item.price) {
                return false;
            }

            this.displayItemAmountModal = true;

            this.itemAmountValue = item.amount;
            this.itemAmountMax = item.amount;

            this.buyingItem = item;
        }
    }
};

// Routing
mo.routes.push({
    path: '/players-shops/view/:id',
    component: viewPlayersShopPage
});

export default viewPlayersShopPage;
</script>