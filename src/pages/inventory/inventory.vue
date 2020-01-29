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

            <div v-if="itemInfo.show"
                class="inventory__info"
                @click="itemInfo.show = false"
            >
                <img :src="`/dist/assets/images/items/large/${itemInfo.id}.gif`"
                    class="inventory__info__illustration"
                >
                <div class="inventory__info__description">
                    <b>{{ itemInfo.name }}</b>
                    <div>Type: <span class="ucfirst">{{ itemInfo.type }}</span></div>
                    <div v-if="itemInfo.params">Params: <b>{{ itemInfo.params }}</b></div>
                    <div v-if="itemInfo.weaponLevel">Weapon Level: {{ itemInfo.weaponLevel }}</div>
                    <div v-if="itemInfo.requiredLevel">Required Level: {{ itemInfo.requiredLevel }}</div>
                    <div>Weight: {{ itemInfo.weight }}</div>
                    <div v-if="itemInfo.applicableJobs">Applicable Job: {{ itemInfo.applicableJobs }}</div>
                </div>
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
            items: [],
            itemInfo: {
                show: false,
                name: '',
                type: '',
                params: '',
                weaponLevel: 0,
                requiredLevel: 0,
                weight: 0,
                applicableJob: ''
            },
            getItemId: 0
        };
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
    mounted() {
        mo.socket.on('getItemsInfoComplete', (items) => {
            const foundItem = items.find((item) => item.id === this.getItemId);

            this.showInfo(foundItem);
        });
    },
    beforeDestroy() {
        mo.socket.off('getItemsInfoComplete');
    },
    methods: {
        showItemInfo(itemId) {
            this.getItemId = itemId;
            mo.socket.emit('getItemsInfo', [itemId]);
        },
        showInfo(item) {
            this.itemInfo.show = true;
            this.itemInfo.id = item.id;
            this.itemInfo.name = item.name;
            this.itemInfo.type = item.class ? item.class : item.type;
            this.itemInfo.params = '';
            this.itemInfo.weaponLevel = 0;
            this.itemInfo.requiredLevel = 0;
            this.itemInfo.weight = item.weight;
            this.itemInfo.applicableJobs = item.jobs === null ? 'All' : '';

            // Making params human readable
            if (item.params) {
                for (const param of Object.keys(item.params)) {
                    this.itemInfo.params += `${param.toUpperCase()}: ${item.params[param]}, `;
                }

                this.itemInfo.params = this.itemInfo.params.substring(0, this.itemInfo.params.length - 2);
            }

            if (item.weaponLevel) {
                this.itemInfo.weaponLevel = item.weaponLevel;
            }

            if (item.requireLevel) {
                this.itemInfo.requiredLevel = item.requireLevel;
            }

            if (item.applicableJobs) {
                this.itemInfo.applicableJobs = item.applicableJobs;
            }
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