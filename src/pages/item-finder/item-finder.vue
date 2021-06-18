<template>
    <section class="item-finder">
        <div class="item-finder-wrapper">
            <div class="item-finder__title">{{ $t('blackMarket.title') }}</div>
            <p class="item-finder__explanation">{{ $t('blackMarket.explanation') }}</p>

            <div class="item-finder__search">
                <p class="item-finder__cost-of-research">{{ $t('blackMarket.costOfResearch') }}: {{ price }} Z</p>
                <search-autocomplete :button-loading="buttonLoading"
                    :suggestions="suggestions"
                    @loading="searchLoading"
                    @search="searchProcess"
                />
            </div>

            <div class="item-finder--block item-finder__item-info">
                <div class="item-finder__title">{{ $t('blackMarket.item') }}</div>

                <loading v-if="loading" />

                <div v-else-if="!item.id"
                    class="item-finder__empty"
                >{{ $t('global.empty') }}</div>

                <template v-else>
                    <img :src="`${serverUrl}/dist/assets/images/items/large/${item.id}.gif`"
                        class="item-finder__item-info__illustration"
                    >
                    <div class="item-finder__item-info__description">
                        <b>{{ item.name }}</b>
                        <div>{{ $t('itemInfo.type') }}: <span class="ucfirst">{{ item.itemClass ? item.itemClass : item.type }}</span> <span v-if="item.twoHanded">({{ $t('itemInfo.twoHanded') }})</span></div>
                        <div v-if="item.params">{{ $t('itemInfo.params') }}: <b>{{ item.params }}</b></div>
                        <div v-if="item.element"
                            class="item-info__element"
                        >{{ $t('global.element') }}: <b :class="`element--${item.element}`">{{ item.element }}</b></div>
                        <div v-if="item.requiredLevel">{{ $t('itemInfo.requiredLevel') }}: {{ item.requiredLevel }}</div>

                        <div v-if="item.durability >= 0 && item.durability !== null && item.defaultDurability">
                            {{ $t('itemInfo.durability') }}:
                            <span :class="{'item-info__high-durability': item.durability > item.defaultDurability, 'item-info__low-durability': item.durability < item.defaultDurability}">
                                {{ item.durability }}
                            </span>
                            / {{ item.maxDurability }}
                        </div>
                        <div v-else-if="item.defaultDurability">{{ $t('itemInfo.durability') }}: {{ item.defaultDurability }} / {{ item.defaultDurability }}</div>

                        <div>{{ $t('global.weight') }}: {{ item.weight }}</div>
                        <div v-if="item.description">{{ item.description }}</div>
                        <div v-if="item.applicableJobs">{{ $t('itemInfo.applicableJob') }}: {{ item.applicableJobs }}</div>
                        <div>{{ $t('blackMarket.shopSellPrice') }}: {{ item.value }}z</div>
                    </div>
                </template>
            </div>

            <div class="item-finder--block">
                <div class="item-finder__title">{{ $t('blackMarket.orders') }}</div>

                <loading v-if="loading" />

                <div v-else-if="!item.id"
                    class="item-finder__empty"
                >{{ $t('global.empty') }}</div>

                <div v-else
                    class="item-finder__orders"
                >
                    <div class="item-finder__orders-sell">
                        <div class="item-finder__title item-finder__title-sub">{{ $t('blackMarket.sellOrders') }}</div>

                        <div class="item-finder__orders-list">
                            <div v-for="(order, index) in orders.sell"
                                :key="index"
                                class="item-finder__orders-list__item"
                            >
                                <item-block :item="order.item"
                                    :show-item-info="false"
                                />
                                {{ order.fullPrice }}z <template v-if="order.item.amount > 1">({{ $t('blackMarket.perItem') }}: {{ order.pricePerItem }} Z)</template>
                            </div>
                        </div>
                    </div>

                    <div class="item-finder__orders-buy">
                        <div class="item-finder__title item-finder__title-sub">{{ $t('blackMarket.buyOrders') }}</div>

                        <div class="item-finder__orders-list">
                            <div v-for="(order, index) in orders.buy"
                                :key="index"
                                class="item-finder__orders-list__item"
                            >
                                <item-block :item="order.item"
                                    :show-item-info="false"
                                />
                                {{ order.fullPrice }}z <template v-if="order.item.amount > 1">({{ $t('blackMarket.perItem') }}: {{ order.pricePerItem }} Z)</template>
                            </div>
                        </div>
                    </div>

                    <div class="item-finder__orders-avg-price">
                        <div class="item-finder__orders-avg-price__price">{{ $t('blackMarket.averagePrice') }}: {{ orders.avgSellPrice }}</div>
                        <div class="item-finder__orders-avg-price__price">{{ $t('blackMarket.averagePrice') }}: {{ orders.avgBuyPrice }}</div>
                    </div>
                </div>
            </div>

            <div class="item-finder--block">
                <div class="item-finder__title">{{ $t('blackMarket.monsterDrops') }}</div>

                <loading v-if="loading" />

                <div v-else-if="!droppedBy.length"
                    class="item-finder__empty"
                >{{ $t('global.empty') }}</div>

                <div v-else
                    class="item-finder__drops"
                >
                    <div v-for="monster in droppedBy"
                        :key="monster.id"
                        class="item-finder__drops-wrapper"
                    >
                        <div class="item-finder__drops__image">
                            <img :src="`${serverUrl}/dist/assets/images/mobs/${monster.id}.gif`">
                        </div>
                        <div class="item-finder__drops__name">
                            {{ monster.name }} {{ monster.dropChance / 100 }}%
                        </div>
                        <div class="item-finder__drops__locations">
                            <div v-for="location in monster.locations"
                                :key="location.mapFile"
                                class="item-finder__drops__locations__location"
                            >
                                {{ location.name }}
                                <img v-if="location.mapFile"
                                    :src="`${serverUrl}/dist/assets/images/map/${location.mapFile}.png`"
                                >
                                <div v-else
                                    class="item-finder__drops__locations__location-dungeon"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="item-finder--block">
                <div class="item-finder__title">{{ $t('blackMarket.market') }}</div>

                <loading v-if="loading" />

                <div v-else-if="!item.id"
                    class="item-finder__empty"
                >{{ $t('global.empty') }}</div>

                <div v-else>
                    <div v-for="(buyInfo, index) in whereToBuy"
                        :key="index"
                        class="item-finder__market"
                    >
                        <item-block :item="buyInfo.item"
                            class="item-finder__market__item"
                        />

                        <div class="item-finder__market__shop-image">
                            <img v-if="buyInfo.shopImage"
                                :src="`/merchant-shops/${buyInfo.shopImage}`"
                            >
                            <img v-else
                                :src="`${serverUrl}/dist/assets/images/items/672.gif`"
                            >
                        </div>

                        <div class="item-finder__market__shop-info">
                            <div class="item-finder__market__shop-name">{{ $t('blackMarket.shopName') }}: {{ buyInfo.shopName }}</div>
                            <div>{{ $t('blackMarket.location') }}: {{ buyInfo.location }}</div>
                        </div>

                        <div class="item-finder__market__price">
                            {{ $t('blackMarket.pricePerItem') }}:<br>
                            {{ buyInfo.price }} Z
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters, mapActions } from 'vuex';

// Components
import attributes from '@components/attributes/attributes.vue';
import loading from '@components/loading/loading.vue';
import searchAutocomplete from '@components/search-autocomplete/search-autocomplete.vue';
import itemBlock from '@components/item-block/item-block.vue';

// Mixins
import chatMixin from '@mixins/chat.js';

// Utils
import discount from '@utils/discount.js';

const itemFinder = {
    components: {
        attributes,
        loading,
        searchAutocomplete,
        itemBlock
    },
    mixins: [chatMixin],
    data() {
        return {
            loading: false,
            buttonLoading: false,
            itemData: null,
            search: '',
            item: {
                id: 0,
                name: '',
                type: '',
                itemClass: '',
                twoHanded: false,
                description: '',
                params: '',
                element: '',
                requiredLevel: 0,
                durability: null,
                maxDurability: null,
                defaultDurability: null,
                weight: 0,
                jobs: null,
                applicableJobs: '',
                value: 0
            },
            droppedBy: [],
            orders: {
                buy: [],
                sell: [],
                avgSellPrice: 0,
                avgBuyPrice: 0
            },
            whereToBuy: []
        };
    },
    computed: {
        ...mapGetters([
            'characterSkills',
            'allItemsNames',
            'serverUrl'
        ]),

        suggestions() {
            return this.allItemsNames.filter((str) => {
                try {
                    return str.toLowerCase().indexOf(this.search.toLowerCase()) >= 0;
                } catch (e) {
                    return false;
                }
            });
        },

        price() {
            return discount(1500, this.characterSkills[25]);
        },
    },
    mounted() {
        mo.socket.on('blackmarketItemComplete', (response) => {
            if (response) {
                this.item.id = response.item.id;
                this.item.name = response.item.name;
                this.item.type = response.item.type;
                this.item.itemClass = response.item.class;
                this.item.twoHanded = response.item.twoHanded || false;
                this.item.description = response.item.description ? response.item.description : '';
                this.item.params = '';
                this.item.element = '';
                this.item.requiredLevel = response.item.requireLevel ? response.item.requireLevel : 0;
                this.item.durability = null;
                this.item.maxDurability = null;
                this.item.defaultDurability = null;
                if (response.item.defaultDurability) {
                    this.item.durability = response.item.defaultDurability;
                    this.item.maxDurability = response.item.defaultDurability;
                    this.item.defaultDurability = response.item.defaultDurability;
                }
                this.item.weight = response.item.weight;
                this.item.applicableJobs = response.item.applicableJobs;
                this.item.value = response.item.value;

                // Making params human readable
                if (response.item.params) {
                    for (const param of Object.keys(response.item.params)) {
                        if (param === 'element') {
                            this.item.element = response.item.params[param];
                        } else {
                            this.item.params += `${param.toUpperCase()}: ${response.item.params[param]}, `;
                        }
                    }

                    this.item.params = this.item.params.substring(0, this.item.params.length - 2);
                }

                // Filter dropped by, by higher chance
                // eslint-disable-next-line
                response.droppedBy.sort((a,b) => (a.dropChance < b.dropChance) ? 1 : ((b.dropChance < a.dropChance) ? -1 : 0));

                this.droppedBy = response.droppedBy;

                this.orders.buy = response.orderData.buy;
                this.orders.sell = response.orderData.sell;
                this.orders.avgSellPrice = response.orderData.avgSellPrice;
                this.orders.avgBuyPrice = response.orderData.avgBuyPrice;

                this.whereToBuy = response.itemsToBuy;
            }

            this.loading = false;
            this.buttonLoading = false;
        });
    },
    beforeDestroy() {
        mo.socket.off('blackmarketItemComplete');
    },
    methods: {
        ...mapActions(['setCharacterAttributes']),

        showItemInfo(itemId) {
            mo.socket.emit('getItemInfo', {
                itemId: itemId
            });
        },
        searchLoading(loading) {
            if (loading) {
                this.buttonLoading = true;
            } else {
                this.buttonLoading = false;
            }
        },
        searchProcess(search) {
            this.loading = true;
            this.buttonLoading = true;

            mo.socket.emit('blackmarketItem', search);
        }
    }
};

// Routing
mo.routes.push({
    path: '/item-finder',
    component: itemFinder
});

export default itemFinder;
</script>