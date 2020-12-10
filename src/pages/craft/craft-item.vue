<template>
    <div class="craft craft-item">
        <div v-if="loading"
            class="craft__wrapper"
        >
            <loading />
        </div>
        <div v-else
            class="craft__wrapper"
        >
            <div class="craft-item__item"
                @click="showItemInfo(craftableItem.itemId)"
            >
                <div class="craft-item__item__title">{{ $t('craft.item') }}</div>
                <img :src="`${serverUrl}/dist/assets/images/items/large/${craftableItem.itemId}.gif`"
                    class="craft-item__item__image"
                >
                <div class="craft-item__item__info">
                    <b>{{ craftableItem.name }} ({{ $t('global.shortLevel') }}: {{ craftableItem.level }})</b><br>
                    {{ $t('craft.craftTime') }}: {{ staticTimer(craftableItem.time) }}<br>
                    {{ $t('global.mpCost') }}: <span :class="{'craft-item__item__info__mp-cost': characterMp < craftableItem.mpCost}">{{ craftableItem.mpCost }}</span><br>
                    {{ $t('craft.successChance') }}: {{ craftableItem.chance }}%<br>
                    {{ $t('craft.outputPerSuccess') }}: x{{ craftableItem.outputAmount }}<br>
                    {{ $t('craft.reward') }}: {{ craftableItem.reward[0] }} {{ $t('global.bexp') }}, {{ craftableItem.reward[1] }} {{ $t('global.jexp') }}<br>
                </div>
            </div>

            <div class="craft-item__amount">
                <div class="craft-item__amount__title">{{ $t('global.amount') }}</div>

                <div class="craft-item__amount__number">
                    <input v-model="amount"
                        :placeholder="$t('global.amount')"
                        type="number"
                        :min="0"
                        :max="maxAmount"
                    >
                </div>
            </div>

            <div class="craft-item__materials">
                <div class="craft-item__materials__title">{{ $t('craft.materialsRequired') }}</div>
                <div v-for="material in craftableItem.craftMaterials"
                    :key="material.id"
                    class="craft-item__materials__material"
                    @click="showItemInfo(material.id)"
                >
                    <img :src="`${serverUrl}/dist/assets/images/items/${material.id}.gif`">
                    <div :class="{'craft-item__materials__material__amount--found': inventory.find((item) => item.itemId === material.id && item.amount >= (material.amount * amount))}"
                        class="craft-item__materials__material__amount"
                    >{{ userMaterialAmount(material.id) }}/{{ material.amount * amount }}</div>
                </div>
            </div>

            <div class="craft-item__price">
                <div class="craft-item__price__title">{{ $t('craft.price') }}</div>
                <div class="craft-item__price__item">
                    <div class="craft-item__price__item__title">{{ $t('craft.priceForToolPerMinute', {
                        tool: tool
                    }) }}</div>
                    <div class="craft-item__price__item__value">{{ price.rentPricePerMinute * amount }} Z</div>
                </div>
                <div class="craft-item__price__item">
                    <div class="craft-item__price__item__title">{{ $t('craft.timeRequired') }}</div>
                    <div class="craft-item__price__item__value">{{ staticTimer(price.timeRequired * amount) }}</div>
                </div>
                <div class="craft-item__price__item">
                    <div class="craft-item__price__item__title">{{ $t('craft.priceForTool', {
                        tool: tool
                    }) }}</div>
                    <div class="craft-item__price__item__value">{{ price.priceForRent * amount }} Z</div>
                </div>
                <div class="craft-item__price__item">
                    <div class="craft-item__price__item__title">{{ $t('craft.locationTax', {
                        locationTax: characterLocation
                    }) }} ({{ price.tax }}%)</div>
                    <div class="craft-item__price__item__value">{{ price.taxForRent * amount }} Z</div>
                </div>
                <div v-if="price.discount !== 0"
                    class="craft-item__price__item craft-item__price__item--discount"
                >
                    <div class="craft-item__price__item__title">{{ $t('craft.discount') }}</div>
                    <div class="craft-item__price__item__value">-{{ price.discount * amount }} Z</div>
                </div>
                <div class="craft-item__price__item craft-item__price__item--total">
                    <div class="craft-item__price__item__title">{{ $t('craft.total') }}</div>
                    <div class="craft-item__price__item__value">{{ price.total * amount }} Z</div>
                </div>
            </div>

            <button :disabled="!canCraft || buttonLoading || amount < 1 || amount > maxAmount"
                class="btn btn-lg game-button craft-item__button"
                @click="craftItem(craftableItem.itemId)"
            >{{ $t('craft.start') }}</button>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import loading from '@components/loading/loading.vue';

// Mixins
import timerMixin from '@mixins/timers.js';

const craftItemPage = {
    components: {
        loading,
    },
    mixins: [timerMixin],
    data() {
        return {
            loading: true,
            buttonLoading: false,
            craftableItem: null,
            price: null,
            tool: 'smithy',
            amount: 1,
            maxAmount: 20000000,
        };
    },
    computed: {
        ...mapGetters([
            'characterSkills',
            'characterMp',
            'characterLocation',
            'characterAttributes',
            'inventory',
            'serverUrl'
        ]),

        canCraft() {
            let haveItems = true;

            // Check if user have enough materials to craft
            for (const material of this.craftableItem.craftMaterials) {
                const find = this.inventory.find((item) => item.itemId === material.id && item.amount >= material.amount);

                if (!find) {
                    haveItems = false;
                }

                // Getting maxAmount
                const maxAmount = Math.floor(this.userMaterialAmount(material.id) / material.amount);

                // Check if there are more items and if the new maxAmount is lower than the previous one, in this case we take the lowest number
                if (maxAmount < this.maxAmount) {
                    this.maxAmount = maxAmount;
                }
            }

            // Check if user have enough MP to craft
            if (this.characterMp < this.craftableItem.mpCost) {
                haveItems = false;
            }

            return haveItems;
        }
    },
    watch: {
        amount() {
            let amount = Number(this.amount);

            if (amount < 0) {
                amount = 0;
            } else if (amount > this.maxAmount) {
                amount = this.maxAmount;
            }


            this.amount = amount;
        }
    },
    mounted() {
        // In case itemId parameter not found redirecting user to main game page, normally should not happen at all
        if (!this.$route.params.itemId) {
            this.$router.go(-1);
        }

        mo.socket.on('getCraftItemComplete', (response) => {
            // In case it's a success an item is found, we populate the data
            if (response.status) {
                // Put all item related data
                this.craftableItem = response.craftableItem;
                // And price related data
                this.price = response.priceData;

                // In case it's an alchemy we need to rename the tool the crafter is going to use
                if (this.craftableItem.category === 'alchemy') {
                    this.tool = 'alchemy table';
                } else {
                    this.tool = 'smithy';
                }

                this.loading = false;
            } else {
                // In case response is not true, then user is not even suppose to be here
                // Player will receive an important system message in this case
                this.$router.go(-1);
            }
        });

        mo.socket.on('craftItemComplete', (response) => {
            // In case craft is successfully started, we trigger the fetch of the craft to show it in UI and redirect user to game window
            if (response) {
                this.$store.commit('craftStart');

                this.$router.go(-2);
            } else {
                this.buttonLoading = false;
            }
        });

        mo.socket.emit('getCraftItem', this.$route.params.itemId);
    },
    beforeDestroy() {
        mo.socket.off('getCraftItemComplete');
        mo.socket.off('craftItemComplete');
    },
    methods: {
        userMaterialAmount(itemId) {
            const findItem = this.inventory.find((item) => item.itemId === itemId);

            if (!findItem) {
                return 0;
            }

            return findItem.amount;
        },
        showItemInfo(itemId) {
            mo.socket.emit('getItemInfo', {
                itemId: itemId
            });
        },
        craftItem(itemId) {
            this.buttonLoading = true;

            mo.socket.emit('craftItem', {
                itemId: itemId,
                amount: this.amount
            });
        }
    }
};

// Routing
mo.routes.push({
    path: '/craft-item/:itemId',
    component: craftItemPage
});

export default craftItemPage;
</script>