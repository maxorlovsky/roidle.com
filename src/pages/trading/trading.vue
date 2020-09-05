<template>
    <section class="trading">
        <p class="trading__title">Trade with {{ traderRight }}</p>

        <div class="trading__window">
            <div class="trading__window__wrapper">
                <div class="trading__tabs">
                    <div class="trading__tabs__left">
                        <div class="trading__tabs__header">Items from {{ traderLeft }}</div>
                    </div>

                    <div class="trading__tabs__right">
                        <div class="trading__tabs__header">Items from  {{ traderRight }}</div>
                    </div>
                </div>

                <div class="trading__window__left">
                    <template v-if="itemsLeft.length">
                        <div v-for="(item, index) in itemsLeft"
                            :key="index"
                            class="shop__item"
                        >
                            <div class="shop__item__image-amount"
                                @click="showItemInfo(item.itemId)"
                            >
                                <img :src="`/dist/assets/images/items/${item.itemId}.gif`">
                                <span>{{ item.amount }}</span>
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

                <div class="trading__window__right">
                    <template v-if="itemsRight.length">
                        <div v-for="(item, index) in itemsRight"
                            :key="index"
                            class="shop__item"
                        >
                            <div class="shop__item__image-amount"
                                @click="showItemInfo(item.itemId)"
                            >
                                <img :src="`/dist/assets/images/items/${item.itemId}.gif`">
                                <span>{{ item.amount }}</span>
                            </div>
                            <div class="shop__item__name-price">
                                <div class="shop__item__name-price__name">{{ item.itemName }}</div>
                                <div class="shop__item__name-price__price">{{ item.price }} Z</div>
                            </div>
                            <div class="shop__item__move"
                                @click="moveItem(index, 'itemsRight', 'itemsRight')"
                            >
                                &gt;
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div class="shop__empty">Empty</div>
                    </template>
                </div>
            </div>
            <div class="trading__window__actions">
                <button class="btn btn-secondary"
                    @click="cancelTrade()"
                >Cancel trade</button>
                <button :disabled="true"
                    class="btn btn-success"
                    @click="confirmTrade()"
                >Confirm Trade</button>
                <button class="btn game-button"
                    @click="lock()"
                >Lock trade</button>
            </div>
        </div>

        <div class="trading__inventory-wrapper">
            <div v-for="(item, index) in inventory"
                :key="index"
                class="trading__inventory-wrapper__item"
                @click="showItemInfo(item.itemId)"
            >
                <img :src="`/dist/assets/images/items/${item.itemId}.gif`">
                <span class="inventory__item__amount">{{ item.amount }}</span>
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

const tradingPage = {
    data() {
        return {
            buttonLoading: false,
            traderLeft: '',
            itemsLeft: [],
            traderRight: '',
            itemsRight: []
        };
    },
    computed: {
        ...mapGetters([
            'characterId',
            'inventory'
        ])
    },
    mounted() {
        mo.socket.on('tradeRejected', () => {
            this.$router.go(-1);
        });

        mo.socket.on('getTradingComplete', (response) => {
            // In case trading not found, we redirect user back from this page
            if (!response) {
                this.$router.go(-1);

                return false;
            }

            if (response.firstUserId === this.characterId) {
                this.traderLeft = response.firstUserName;
                this.traderRight = response.secondUserName;
            } else {
                this.traderLeft = response.secondUserName;
                this.traderRight = response.firstUserName;
            }
        });

        mo.socket.emit('getTrading');

        // Hiding chat
        this.$store.commit('showChat', false);
    },
    beforeDestroy() {
        mo.socket.off('getTradingComplete');

        // Showing chat
        this.$store.commit('showChat', true);
    },
    methods: {
        showItemInfo(itemId) {
            mo.socket.emit('getItemsInfo', [itemId]);
        }
    }
};

// Routing
mo.routes.push({
    path: '/trading',
    component: tradingPage
});

export default tradingPage;
</script>