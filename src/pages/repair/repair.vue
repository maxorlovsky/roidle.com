<template>
    <div class="repair">
        <div v-if="loading"
            class="repair__wrapper"
        >
            <loading />
        </div>
        <div v-else
            class="repair__wrapper"
        >
            <div class="repair__items-list">
                <div class="repair__title">Items to repair</div>

                <div v-for="(item, index) in brokenItems"
                    :key="index"
                    class="repair__item"
                >
                    <div :class="{
                            'repair__item__image-amount--broken': item.broken,
                            'repair__item__image-amount--not-pristine': item.durability < item.maxDurability
                        }"
                        class="repair__item__image-amount"
                        @click="showItemInfo(item)"
                    >
                        <img :src="`/dist/assets/images/items/${item.itemId}.gif`">
                    </div>
                    <div class="repair__item__info">
                        <div class="repair__item__info__name">{{ item.name }}</div>
                        <div class="repair__item__info__durability">{{ item.durability }} / {{ item.maxDurability }}</div>
                        <div class="repair__item__info__cost">Cost: {{ item.price }} Z</div>
                    </div>
                    <div v-if="item.added"
                        class="repair__item__add"
                        @click="removeItem(item)"
                    >-</div>
                    <div v-else
                        class="repair__item__add"
                        @click="addItem(item)"
                    >+</div>
                </div>
            </div>

            <div class="repair__price">
                <div class="repair__price__title">Price</div>
                <div class="repair__price__item">
                    <div class="repair__price__item__title">Repair cost</div>
                    <div class="repair__price__item__value">{{ repairCost }} Z</div>
                </div>
                <div class="repair__price__item">
                    <div class="repair__price__item__title">Items amount</div>
                    <div class="repair__price__item__value">{{ itemsToFix.length }}</div>
                </div>
                <div class="repair__price__item">
                    <div class="repair__price__item__title">{{ characterLocation }}'s tax ({{ price.tax }}%)</div>
                    <div class="repair__price__item__value">{{ taxPrice }} Z</div>
                </div>
                <div v-if="price.discount !== 0"
                    class="repair__price__item repair__price__item--discount"
                >
                    <div class="repair__price__item__title">Discount</div>
                    <div class="repair__price__item__value">
                        <template v-if="discountPrice > 0">-</template>
                        {{ discountPrice }} Z
                    </div>
                </div>
                <div class="repair__price__item repair__price__item--total">
                    <div class="repair__price__item__title">TOTAL</div>
                    <div class="repair__price__item__value">{{ totalCost }} Z</div>
                </div>
            </div>

            <button :disabled="!itemsToFix.length || characterZeny < repairCost || buttonLoading"
                class="btn btn-lg game-button repair__button"
                @click="repairItems()"
            >Repair</button>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import loading from '@components/loading/loading.vue';

const repairPage = {
    components: {
        loading,
    },
    data() {
        return {
            loading: true,
            buttonLoading: false,
            brokenItems: [],
            itemsToFix: [],
            price: {
                tax: 0,
                discount: 0
            }
        };
    },
    computed: {
        ...mapGetters([
            'characterZeny',
            'characterLocation'
        ]),

        repairCost() {
            return this.itemsToFix.reduce((acc, value) => acc + value.price, 0);
        },
        taxPrice() {
            return Math.floor(this.repairCost * (this.price.tax / 100)) || 0;
        },
        discountPrice() {
            return Math.floor((this.repairCost + this.taxPrice) * this.price.discount / 100) || 0;
        },
        totalCost() {
            return this.repairCost + this.taxPrice - this.discountPrice;
        }
    },
    mounted() {
        mo.socket.on('repairItemsComplete', (response) => {
            if (response) {
                this.brokenItems = [];
                this.itemsToFix = [];

                mo.socket.emit('getBrokenItems');
            }
        });

        mo.socket.on('getBrokenItemsComplete', (response) => {
            this.loading = false;
            this.buttonLoading = false;
            this.brokenItems = response.brokenItems;
            this.price.tax = response.tax;
            this.price.discount = response.discount;
        });

        mo.socket.emit('getBrokenItems');
    },
    beforeDestroy() {
        mo.socket.off('getBrokenItemsComplete');
    },
    methods: {
        repairItems() {
            const ids = [];

            this.buttonLoading = true;
            this.itemsToFix.map((item) => ids.push(item.id));

            mo.socket.emit('repairItems', ids);
        },
        showItemInfo(item) {
            mo.socket.emit('getItemInfo', {
                itemId: item.itemId,
                inventoryId: item.id
            });
        },
        addItem(item) {
            item.added = true;

            this.itemsToFix.push({
                id: item.id,
                price: item.price
            });
        },
        removeItem(item) {
            item.added = false;

            const index = this.itemsToFix.findIndex((index) => index.id === item.id);

            this.itemsToFix.splice(index, 1);
        }
    }
};

// Routing
mo.routes.push({
    path: '/repair',
    component: repairPage
});

export default repairPage;
</script>