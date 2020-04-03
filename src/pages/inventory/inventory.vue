<template>
    <section class="inventory">
        <div class="inventory-wrapper">
            <div class="inventory__weight">Weight: <span :class="{'inventory__weight--critical': criticalWeight}">{{ inventoryWeight }}</span> / {{ characterAttributes.weight }}</div>
            <div v-for="(item, index) in inventory"
                :key="index"
                class="inventory__item"
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

const inventoryPage = {
    data() {
        return {};
    },
    computed: {
        ...mapGetters(['inventory', 'inventoryWeight']),
        characterAttributes() {
            return this.$store.getters.get('characterAttributes') || {};
        },
        criticalWeight() {
            return (this.inventoryWeight * 100) / this.characterAttributes.weight > 90;
        }
    },
    methods: {
        showItemInfo(itemId) {
            mo.socket.emit('getItemsInfo', [itemId]);
        }
    }
};

// Routing
mo.routes.push({
    path: '/inventory',
    component: inventoryPage
});

export default inventoryPage;
</script>