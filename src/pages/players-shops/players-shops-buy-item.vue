<template>
    <div class="players-shops__buy">
        <div class="players-shops__title">{{ $t('shop.buyingItem') }}</div>

        <p>{{ $t('shop.shopLocationTaxForBuying', {
            location: characterLocation
        }) }} <b>{{ tax }}%</b></p>

        <button class="btn game-button players-shops__buy__add"
            @click="displayItemBuyModal = true"
        >{{ $t('shop.addNewOrder') }}</button>

        <template v-if="items.length">
            <div v-for="(item, index) in filteredItems"
                :key="index"
                class="players-shops__buy-item"
            >
                <div class="players-shops__buy-item__image-amount"
                    @click.exact="showItemInfo(item.itemId)"
                    @click.ctrl="parseItemToChat(item.itemName)"
                >
                    <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                    <span>{{ item.amount }}</span>
                </div>
                <div class="players-shops__buy-item__name-price">
                    <div class="players-shops__buy-item__name-price__name">{{ item.itemName }}</div>
                    <div v-if="item.maxDurability"
                        class="players-shops__buy-item__name-price__durability"
                    >
                        {{ $t('shop.buyDurabilityRange') }}: {{ item.durability }} - {{ item.maxDurability }}
                    </div>
                    <div class="players-shops__buy-item__name-price__price">
                        {{ $t('shop.buyPricePerItem') }}: {{ Math.floor(item.price / item.amount) }}Z
                    </div>
                    <div class="players-shops__buy-item__name-price__price">
                        {{ $t('shop.buyPriceRemaining') }}: {{ item.price }}Z
                    </div>
                </div>
                <div :class="{ 'players-shops__buy-item__move--disabled': buttonLoading }"
                    class="players-shops__buy-item__move"
                    @click="cancelBuyOrder(item)"
                >
                    &lt;
                </div>
            </div>
        </template>
        <template v-else>
            <div class="players-shops__buy__empty">{{ $t('global.empty') }}</div>
        </template>

        <div v-if="displayItemBuyModal"
            class="modal"
        >
            <div class="modal__content players-shops__buy-search">
                <div class="search-autocomplete">
                    <div class="search-input">
                        <input v-model="itemBuyItem"
                            placeholder="Search item name"
                            :readonly="buttonLoading"
                            maxlength="100"
                            type="text"
                            @keydown.enter="enter"
                            @keydown.down="down"
                            @keydown.up="up"
                            @input="change"
                        >
                        <div v-show="itemBuyItem"
                            class="search-input__close"
                            @click="itemBuyItem = ''"
                        >X</div>
                    </div>

                    <ul v-show="open"
                        class="search-autocomplete__dropdown"
                    >
                        <li v-for="(suggestion, index) in matches"
                            :key="suggestion"
                            :class="{'search-autocomplete__dropdown--active': isActive(index)}"
                            @click="suggestionClick(index)"
                        >
                            {{ suggestion }}
                        </li>
                    </ul>
                </div>

                <template v-if="buyItem.itemId">
                    <div class="players-shops__buy-search__item"
                        @click="getItem(buyItem.itemId)"
                    >
                        <img :src="`${serverUrl}/dist/assets/images/items/${buyItem.itemId}.gif`">
                        <span v-if="buyItem.defaultDurability"
                            class="players-shops__transactions-item__item__amount"
                        >
                            {{ buyItem.defaultDurability }}/{{ buyItem.defaultDurability }}
                        </span>
                    </div>

                    <div>
                        <div class="form-heading">{{ $t('global.amount') }}:</div>
                        <input ref="itemAmountValue"
                            v-model="buyItem.amount"
                            :placeholder="$t('global.amount')"
                            min="1"
                            max="9999"
                            type="number"
                            size="9"
                        >
                    </div>

                    <div v-if="buyItem.defaultDurability">
                        <div class="form-heading">{{ $t('shop.buyItemMinDurability') }}:</div>
                        <input v-model="buyItem.minDurability"
                            :placeholder="$t('shop.buyItemMinDurability')"
                            min="1"
                            :max="buyItem.defaultDurability + 10"
                            type="number"
                            size="3"
                        >
                    </div>

                    <div v-if="buyItem.defaultDurability">
                        <div class="form-heading">{{ $t('shop.buyItemMaxDurability') }}:</div>
                        <input v-model="buyItem.maxDurability"
                            :placeholder="$t('shop.buyItemMaxDurability')"
                            min="1"
                            :max="buyItem.defaultDurability + 10"
                            type="number"
                            size="3"
                        >
                    </div>

                    <div>
                        <div class="form-heading">{{ $t('shop.buyItemPrice') }}:</div>
                        <input v-model="buyItem.price"
                            :placeholder="$t('shop.buyItemPrice')"
                            min="1"
                            :max="2000000000"
                            type="number"
                            size="10"
                        >
                    </div>

                    <div>
                        <div class="form-heading">{{ $t('shop.fullPrice') }}:</div>
                        <b>{{ fullPrice }}</b>
                    </div>
                </template>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="closeModal()"
                >{{ $t('global.cancel') }}</button>
                <button :disabled="buttonLoading || parentButtonLoading"
                    class="btn game-button"
                    @click="confirmBuyOrder()"
                >{{ $t('shop.confirm') }}</button>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Mixins
import chatMixin from '@mixins/chat.js';

export default {
    name: 'players-shops-buy-item',
    mixins: [chatMixin],
    props: {
        tax: {
            type: Number,
            default: 1
        },
        items: {
            type: Array,
            default: () => []
        },
        parentButtonLoading: {
            type: Boolean,
            default: false
        },
    },
    data() {
        return {
            buttonLoading: false,
            itemBuyItem: '',
            searchItems: '',
            open: false,
            current: 0,
            displayItemBuyModal: false,
            buyItem: {
                minDurability: 0,
                maxDurability: 0,
                price: 0,
                amount: 1,
                itemId: 0,
                defaultDurability: 0
            }
        };
    },
    computed: {
        ...mapGetters([
            'characterLocation',
            'allItemsNames',
            'serverUrl'
        ]),

        matches() {
            return this.allItemsNames.filter((str) => {
                try {
                    return str.toLowerCase().indexOf(this.itemBuyItem.toLowerCase()) >= 0;
                } catch (e) {
                    return false;
                }
            });
        },
        fullPrice() {
            const price = Number(this.buyItem.price);

            return price * this.buyItem.amount;
        },
        filteredItems() {
            let inv = this.items;

            if (this.searchItems) {
                inv = inv.filter((item) => item.itemName.toLowerCase().indexOf(this.searchItems.toLowerCase()) > -1);
            }

            return inv || [];
        }
    },
    mounted() {
        mo.socket.on('shopCancelBuyOrderComplete', (response) => {
            // In case of success we trigger call to re-fetch shop
            if (response) {
                mo.socket.emit('getMyShop');
            }

            this.buttonLoading = false;
        });

        mo.socket.on('shopPlaceBuyOrderComplete', (response) => {
            // In case of success we close modal and trigger call to re-fetch shop
            if (response) {
                this.closeModal();
                mo.socket.emit('getMyShop');
            }

            this.buttonLoading = false;
        });

        mo.socket.on('getItemInfoForBuyComplete', (item) => {
            this.buyItem.itemId = item.id;
            this.buyItem.amount = 1;
            this.buyItem.price = item.value;

            if (item.defaultDurability) {
                this.buyItem.defaultDurability = item.defaultDurability;
                this.buyItem.minDurability = item.defaultDurability;
                this.buyItem.maxDurability = item.defaultDurability;
            } else {
                this.buyItem.defaultDurability = 0;
                this.buyItem.minDurability = 0;
                this.buyItem.maxDurability = 0;
            }

            this.buttonLoading = false;
        });
    },
    beforeDestroy() {
        mo.socket.off('shopCancelBuyOrderComplete');
        mo.socket.off('shopPlaceBuyOrderComplete');
        mo.socket.off('getItemInfoForBuyComplete');
    },
    methods: {
        showItemInfo(itemId) {
            mo.socket.emit('getItemInfo', {
                itemId: itemId
            });
        },
        cancelBuyOrder(item) {
            this.buttonLoading = true;

            mo.socket.emit('shopCancelBuyOrder', item.id);
        },
        confirmBuyOrder() {
            this.buttonLoading = true;

            mo.socket.emit('shopPlaceBuyOrder', {
                itemId: this.buyItem.itemId,
                amount: this.buyItem.amount,
                price: this.buyItem.price,
                minDurability: this.buyItem.minDurability,
                maxDurability: this.buyItem.maxDurability
            });
        },
        getItem(itemId) {
            mo.socket.emit('getItemInfo', {
                itemId: itemId
            });
        },
        closeModal() {
            this.displayItemBuyModal = false;

            this.buyItem.minDurability = 0;
            this.buyItem.maxDurability = 0;
            this.buyItem.price = 0;
            this.buyItem.amount = 1;
            this.buyItem.itemId = 0;
            this.buyItem.defaultDurability = 0;
        },
        enter(index) {
            if (this.buttonLoading) {
                return false;
            }

            if (index && this.matches[index]) {
                this.itemBuyItem = this.matches[index];
            } else if (this.current && this.matches[this.current]) {
                this.itemBuyItem = this.matches[this.current];
            }

            this.open = false;

            this.buttonLoading = true;

            mo.socket.emit('getItemInfoForBuy', this.itemBuyItem);
        },
        up() {
            if (this.current > 0) {
                this.current--;
            }
        },
        down() {
            if (this.current < this.matches.length - 1) {
                this.current++;
            }
        },
        isActive(index) {
            return index === this.current;
        },
        change() {
            if (this.buttonLoading) {
                return false;
            }

            if (!this.open) {
                this.open = true;
                this.current = 0;
            }
        },
        suggestionClick(index) {
            this.enter(index);
        }
    }
};
</script>