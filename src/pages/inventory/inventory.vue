<template>
    <section class="inventory">
        <div class="inventory-wrapper">
            <div class="inventory__weight">Weight: <span :class="{'inventory__weight--critical': criticalWeight}">{{ inventoryWeight }}</span> / {{ characterAttributes.weight }}</div>
            <div v-for="(item, index) in inventory"
                :key="index"
                :class="{'inventory__item--broken': item.broken}"
                class="inventory__item"
                @click="showItemInfo(item)"
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
            return Math.floor((this.inventoryWeight * 100) / this.characterAttributes.weight) >= 90;
        }
    },
    mounted() {
        // Hiding chat
        this.$store.commit('showChat', false);
    },
    beforeDestroy() {
        // Showing chat
        this.$store.commit('showChat', true);
    },
    methods: {
        showItemInfo(item) {
            // Marking that item is open in inventory of a user
            this.$store.commit('itemInfoInventoryPage');

            mo.socket.emit('getItemInfo', {
                itemId: item.itemId,
                inventoryId: item.id
            });
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