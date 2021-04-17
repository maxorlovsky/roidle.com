<template>
    <div class="players-shops__buy">
        <div class="players-shops__title">{{ $t('shop.buyingItem') }}</div>

        <button class="btn game-button players-shops__buy__add"
            @click="displayItemBuyModal = true"
        >{{ $t('shop.addNewOrder') }}</button>

        <!--<p>{{ $t('shop.shopLocationTaxForSelling', {
            location: characterLocation
        }) }} <b>{{ locationTax }}%</b></p>

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
        </div>-->

        <template v-if="items.length">
            <div v-for="(item, index) in filteredItems"
                :key="index"
                class="players-shops__sold-item"
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
                    <div class="players-shops__sold-item__name-price__price">
                        {{ $t('shop.endPrice') }}: {{ Math.floor(Number(item.price) + (Number(item.price) * (tax / 100))) }} Z
                    </div>
                </div>
                <div :class="{ 'players-shops__sold-item__move--disabled': buttonLoading }"
                    class="players-shops__sold-item__move"
                    @click="cancelBuyOrder(item)"
                >
                    &lt;
                </div>
            </div>
        </template>
        <template v-else>
            <div class="players-shops__buy-wrapper__empty">{{ $t('global.empty') }}</div>
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
                        <div class="form-heading">{{ $t('shop.buyItemPriceWithTax') }}:</div>
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

export default {
    name: 'players-shops-buy-item',
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
            'huntStatus',
            'characterId',
            'characterSkills',
            'serverUrl',
            'allItemsNames'
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

            return Math.floor(price + (price * (this.tax / 100))) * this.buyItem.amount;
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
        mo.socket.on('shopPlaceBuyOrderComplete', () => {
            this.closeModal();
            mo.socket.emit('getMyShop');
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
        mo.socket.off('getItemInfoForBuyComplete');
    },
    methods: {
        cancelBuyOrder() {
            //
        },
        confirmBuyOrder() {
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

            if (this.matches[index || this.current]) {
                this.itemBuyItem = this.matches[index || this.current];
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