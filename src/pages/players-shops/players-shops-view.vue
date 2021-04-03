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
            <div class="players-shops__sold-items-wrapper">
                <div class="players-shops__title">{{ $t('shop.insideTheShop') }}</div>
                <div class="players-shops__shop-title">"{{ shopName }}"</div>

                <div class="players-shops__top">
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

                    <div class="players-shops__top__sorting">
                        <div class="players-shops__top__sorting__label">{{ $t('global.show') }}:</div>
                        <select v-model="sortBy">
                            <option value="all">{{ $t('global.all') }}</option>
                            <option value="consumables">{{ $t('global.consumables') }}</option>
                            <option value="equipment">{{ $t('global.equipment') }}</option>
                            <option value="etc">{{ $t('global.etc') }}</option>
                        </select>
                    </div>
                </div>

                <template v-if="filteredItems.length">
                    <div v-for="(item, index) in filteredItems"
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
        </div>

        <div v-if="displayItemAmountModal"
            class="modal"
        >
            <div class="modal__content players-shops__amount">
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
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="closeItemAmountModal()"
                >{{ $t('global.cancel') }}</button>
                <button :disabled="itemAmountValue < 1 || itemAmountValue > itemAmountMax || buttonLoading || characterZeny < buyingItem.price * itemAmountValue"
                    class="btn game-button"
                    @click="confirmBuy()"
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

// Utils
import { sort as inventorySort } from '@utils/inventory.js';

// Mixins
import chatMixin from '@mixins/chat.js';

const viewPlayersShopPage = {
    components: {
        loading,
    },
    mixins: [chatMixin],
    data() {
        return {
            loading: true,
            buttonLoading: false,
            shopId: 0,
            shopName: '',
            shopItems: [],
            displayItemAmountModal: false,
            itemAmountValue: 1,
            itemAmountMax: 1,
            buyingItem: null,
            search: '',
            sortBy: 'all',
        };
    },
    computed: {
        ...mapGetters([
            'characterZeny',
            'serverUrl'
        ]),

        filteredItems() {
            let inv = this.shopItems;

            if (this.search) {
                inv = inv.filter((item) => item.itemName.toLowerCase().indexOf(this.search.toLowerCase()) > -1);
            }

            inv = inventorySort(inv, this.sortBy);

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

            this.loading = false;
        });

        mo.socket.emit('getShop', this.$route.params.id);
    },
    beforeDestroy() {
        mo.socket.off('shopBuyItemComplete');
        mo.socket.off('getShopComplete');
    },
    methods: {
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
                amount: this.itemAmountValue
            });
        },
        closeItemAmountModal() {
            this.displayItemAmountModal = false;
            this.itemAmountValue = 1;
            this.itemAmountMax = 1;
            this.buyingItem = null;
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