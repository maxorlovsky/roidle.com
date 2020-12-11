<template>
    <section class="inventory">
        <div class="inventory-wrapper">
            <div class="inventory__weight">{{ $t('global.weight') }}: <span :class="{'inventory__weight--critical': criticalWeight}">{{ inventoryWeight }}</span> / {{ characterAttributes.weight }}</div>

            <div class="search-input">
                <input v-model="search"
                    :placeholder="$t('global.search')"
                    maxlength="50"
                    type="text"
                >
                <div v-show="search"
                    class="search-input__close"
                    @click="search = ''"
                >X</div>
            </div>

            <div v-for="(item, index) in filteredInventory"
                :key="index"
                :class="{
                    'inventory__item--broken': item.broken,
                    'inventory__item--not-pristine': item.defaultDurability && item.durability < item.defaultDurability,
                    'inventory__item--high-quality': item.durability && item.durability > item.defaultDurability
                }"
                class="inventory__item"
                @click="showItemInfo(item)"
            >
                <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                <span v-if="item.maxDurability"
                    class="inventory__item__amount"
                >{{ item.durability }}/{{ item.maxDurability }}</span>
                <span v-else
                    class="inventory__item__amount"
                >{{ item.amount }}</span>
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

const inventoryPage = {
    data() {
        return {
            search: ''
        };
    },
    computed: {
        ...mapGetters([
            'inventory',
            'inventoryWeight',
            'serverUrl'
        ]),
        characterAttributes() {
            return this.$store.getters.get('characterAttributes') || {};
        },
        criticalWeight() {
            return Math.floor((this.inventoryWeight * 100) / this.characterAttributes.weight) >= 90;
        },
        filteredInventory() {
            let inv = this.inventory;

            if (this.search) {
                inv = inv.filter((item) => item.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1);
            }

            return inv || [];
        }
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