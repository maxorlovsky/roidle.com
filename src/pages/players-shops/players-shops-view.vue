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
                <div class="players-shops__title">Inside the Shop</div>
                <div class="players-shops__shop-title">"{{ shopName }}"</div>

                <template v-if="shopItems.length">
                    <div v-for="(item, index) in shopItems"
                        :key="index"
                        class="players-shops__sold-item players-shops__view-shop"
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
                            <div class="players-shops__sold-item__name-price__price">Price:
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
                    <div class="players-shops__sold-items-wrapper__empty">Empty</div>
                </template>
            </div>
        </div>

        <div v-if="displayItemAmountModal"
            class="modal"
        >
            <div class="modal__content players-shops__amount">
                <input ref="itemAmountValue"
                    v-model="itemAmountValue"
                    min="1"
                    :max="itemAmountMax"
                    type="number"
                    size="9"
                    placeholder="Amount"
                >
                <p>Full price: <b :class="{ 'players-shops__amount__zeny--not-enough': characterZeny < buyingItem.price * itemAmountValue }">{{ buyingItem.price * itemAmountValue }}Z</b></p>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="closeItemAmountModal()"
                >Cancel</button>
                <button :disabled="itemAmountValue < 1 || itemAmountValue > itemAmountMax || buttonLoading || characterZeny < buyingItem.price * itemAmountValue"
                    class="btn game-button"
                    @click="confirmBuy()"
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

const viewPlayersShopPage = {
    components: {
        loading,
    },
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
        };
    },
    computed: {
        ...mapGetters(['characterZeny'])
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
            this.$router.push('/players-shops');
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
                this.$router.push('/players-shops');
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

            // In case we don't need to display zeny, means that item is already in the list of selling items
            // We also check if the amount of item that we're trying to add is just one, in this case we don't really need to display modal and can proceed with submit
            if (item.amount <= 1) {
                this.displayItemAmountModal = false;
                this.confirmBuy();
            }
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