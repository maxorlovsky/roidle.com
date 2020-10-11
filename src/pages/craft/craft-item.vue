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
                <div class="craft-item__item__title">Item</div>
                <img :src="`/dist/assets/images/items/large/${craftableItem.itemId}.gif`"
                    class="craft-item__item__image"
                >
                <div class="craft-item__item__info">
                    <b>{{ craftableItem.name }} (Lv: {{ craftableItem.level }})</b><br>
                    Craft Time: {{ craftableItem.time / 60 }}m<br>
                    MP Cost: <span :class="{'craft-item__item__info__mp-cost': characterMp < craftableItem.mpCost}">{{ craftableItem.mpCost }}</span><br>
                    Success Chance: {{ craftableItem.chance }}%<br>
                    Reward: {{ craftableItem.reward[0] }} B.Exp, {{ craftableItem.reward[1] }} J.Exp<br>
                </div>
            </div>

            <div class="craft-item__materials">
                <div class="craft-item__materials__title">Materials required</div>
                <div v-for="material in craftableItem.craftMaterials"
                    :key="material.id"
                    class="craft-item__materials__material"
                    @click="showItemInfo(material.id)"
                >
                    <img :src="`/dist/assets/images/items/${material.id}.gif`">
                    <div :class="{'craft-item__materials__material__amount--found': inventory.find((item) => item.itemId === material.id && item.amount >= material.amount)}"
                        class="craft-item__materials__material__amount"
                    >{{ material.amount }}</div>
                </div>
            </div>

            <div class="craft-item__price">
                <div class="craft-item__price__title">Price</div>
                <div class="craft-item__price__item">
                    <div class="craft-item__price__item__title">Price for using smithy (per minute)</div>
                    <div class="craft-item__price__item__value">{{ price.smithyPricePerMinute }} Z</div>
                </div>
                <div class="craft-item__price__item">
                    <div class="craft-item__price__item__title">Time required</div>
                    <div class="craft-item__price__item__value">{{ price.timeRequired }}m</div>
                </div>
                <div class="craft-item__price__item">
                    <div class="craft-item__price__item__title">Price for using smithy</div>
                    <div class="craft-item__price__item__value">{{ price.priceForSmithy }} Z</div>
                </div>
                <div class="craft-item__price__item">
                    <div class="craft-item__price__item__title">{{ characterLocation }}'s tax ({{ price.tax }}%)</div>
                    <div class="craft-item__price__item__value">{{ price.taxForSmithy }} Z</div>
                </div>
                <div class="craft-item__price__item craft-item__price__item--total">
                    <div class="craft-item__price__item__title">TOTAL</div>
                    <div class="craft-item__price__item__value">{{ price.total }} Z</div>
                </div>
            </div>

            <button :disabled="!canCraft || buttonLoading"
                class="btn btn-lg game-button craft-item__button"
                @click="craftItem(craftableItem.itemId)"
            >Start</button>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import loading from '@components/loading/loading.vue';

const craftItemPage = {
    components: {
        loading,
    },
    data() {
        return {
            loading: true,
            buttonLoading: false,
            craftableItem: null,
            price: null
        };
    },
    computed: {
        ...mapGetters([
            'characterSkills',
            'characterMp',
            'characterLocation',
            'characterAttributes',
            'inventory'
        ]),

        canCraft() {
            let haveItems = true;

            // Check if user have enough materials to craft
            for (const material of this.craftableItem.craftMaterials) {
                const find = this.inventory.find((item) => item.itemId === material.id && item.amount >= material.amount);

                if (!find) {
                    haveItems = false;
                }
            }

            // Check if user have enough MP to craft
            if (this.characterMp < this.craftableItem.mpCost) {
                haveItems = false;
            }

            return haveItems;
        }
    },
    mounted() {
        // In case itemId parameter not found redirecting user to main game page, normally should not happen at all
        if (!this.$route.params.itemId) {
            this.$router.push('/game');
        }

        mo.socket.on('getCraftItemComplete', (response) => {
            if (response.status) {
                this.craftableItem = response.craftableItem;
                this.price = response.priceData;

                this.loading = false;
            } else {
                // In case response is not true, then user is not even suppose to be here
                this.$router.push('/game');
            }
        });

        mo.socket.on('craftItemComplete', () => {
            mo.socket.emit('getCraft');

            // Show chat
            this.$store.commit('showChat', true);

            this.$router.push('/game');
        });

        mo.socket.emit('getCraftItem', this.$route.params.itemId);
    },
    beforeDestroy() {
        mo.socket.off('getCraftItemComplete');
        mo.socket.off('craftItemComplete');
    },
    methods: {
        showItemInfo(itemId) {
            mo.socket.emit('getItemInfo', {
                itemId: itemId
            });
        },
        craftItem(itemId) {
            this.buttonLoading = true;

            mo.socket.emit('craftItem', itemId);
        }
    }
};

// Routing
mo.routes.push({
    path: '/craft/:itemId',
    component: craftItemPage
});

export default craftItemPage;
</script>