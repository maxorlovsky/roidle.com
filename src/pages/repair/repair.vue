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

            <div class="repair__information">Your items have a <b>chance to completely destroy item during repair</b>, in this case you will pay only half the price of the attempt to fix your item. Select items that you want to repair on the right and click button at the bottom. Or click repair all if you have enough zeny.</div>

            <div class="repair__repair">
                <div class="repair__repair__cost">{{ repairCost }} Z | {{ itemsToFix.length }} items</div>
                <button :disabled="!itemsToFix.length || characterZeny < repairCost || buttonLoading"
                    class="btn game-button"
                    @click="repairItems()"
                >Repair</button>
            </div>

            <div class="repair__repair-all">
                <button :disabled="characterZeny < repairCost || buttonLoading"
                    class="btn btn-lg game-button"
                    @click="repairAllItems()"
                >Repair All ({{ fullRepairCost }} Z)</button>
            </div>
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
            itemsToFix: []
        };
    },
    computed: {
        ...mapGetters(['characterZeny']),

        repairCost() {
            return this.itemsToFix.reduce((acc, value) => acc + value.price, 0);
        },
        fullRepairCost() {
            return this.brokenItems.reduce((acc, value) => acc + value.price, 0);
        },
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
        });

        mo.socket.emit('getBrokenItems');

        // Hide chat
        this.$store.commit('showChat', false);
    },
    beforeDestroy() {
        mo.socket.off('getBrokenItemsComplete');

        // Hide chat
        this.$store.commit('showChat', true);
    },
    methods: {
        repairItems() {
            const ids = [];

            this.buttonLoading = true;
            this.itemsToFix.map((item) => ids.push(item.id));

            mo.socket.emit('repairItems', ids);
        },
        repairAllItems() {
            const ids = [];

            this.buttonLoading = true;
            this.brokenItems.map((item) => ids.push(item.id));

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