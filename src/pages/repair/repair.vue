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
                <div class="repair__title">{{ $t('repair.itemsToRepair') }}</div>

                <template v-if="brokenItems && brokenItems.length">
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
                            <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                        </div>
                        <div class="repair__item__info">
                            <div class="repair__item__info__name">{{ item.name }}</div>
                            <div class="repair__item__info__durability">{{ item.durability }} / {{ item.maxDurability }}</div>
                            <div class="repair__item__info__cost">{{ $t('repair.cost') }}: {{ item.price }} Z</div>
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
                </template>
                <div v-else
                    class="repair__items-list__empty"
                >
                    {{ $t('repair.noItems') }}
                </div>
            </div>

            <div class="repair__price">
                <div class="repair__price__title">{{ $t('repair.price') }}</div>
                <div class="repair__price__item">
                    <div class="repair__price__item__title">{{ $t('repair.repairCost') }}</div>
                    <div class="repair__price__item__value">{{ repairCost }} Z</div>
                </div>
                <div class="repair__price__item">
                    <div class="repair__price__item__title">{{ $t('repair.itemsAmount') }}</div>
                    <div class="repair__price__item__value">{{ itemsToFix.length }}</div>
                </div>
                <div class="repair__price__item">
                    <div class="repair__price__item__title">{{ characterLocation }}{{ $t('repair.locationTax') }} ({{ price.tax }}%)</div>
                    <div class="repair__price__item__value">{{ taxPrice }} Z</div>
                </div>
                <div v-if="price.discount !== 0"
                    class="repair__price__item repair__price__item--discount"
                >
                    <div class="repair__price__item__title">{{ $t('repair.discount') }}</div>
                    <div class="repair__price__item__value">
                        <template v-if="discountPrice > 0">-</template>
                        {{ discountPrice }} Z
                    </div>
                </div>
                <div class="repair__price__item repair__price__item--total">
                    <div class="repair__price__item__title">{{ $t('repair.total') }}</div>
                    <div class="repair__price__item__value">{{ totalCost }} Z</div>
                </div>
            </div>

            <button :disabled="!itemsToFix.length || characterZeny < repairCost || buttonLoading"
                class="btn btn-lg game-button repair__button"
                @click="repairItems()"
            >{{ $t('repair.repair') }}</button>
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
            'characterLocation',
            'serverUrl'
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
                this.equipeToFix = [];

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
            const itemsIds = [];
            const equipmentIds = [];

            this.buttonLoading = true;
            this.itemsToFix.map((item) => {
                if (item.equipment) {
                    equipmentIds.push(item.id);
                } else {
                    itemsIds.push(item.id);
                }

                return true;
            });


            mo.socket.emit('repairItems', itemsIds, equipmentIds);
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
                price: item.price,
                equipment: item.equipment
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