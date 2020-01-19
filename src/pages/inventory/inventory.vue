<template>
    <section class="inventory">
        <div class="inventory-wrapper">
            <div class="inventory__weight">Weight: <span :class="{'inventory__weight--critical': itemsWeight.critical}">{{ itemsWeight.current }}</span> / {{ itemsWeight.max }}</div>
            <div v-for="item in items"
                :key="item.id"
                class="inventory__item"
                @click="showInfo(item)"
            >
                <img :src="`/dist/assets/images/items/${item.id}.gif`">
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
                    <div v-if="itemInfo.applicableJob">Applicable Job: {{ itemInfo.applicableJob }}</div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Configs
import jobs from '../../../config/jobs.json';

// Utils
import statsUtils from '../../utils/stats.js';
import itemsUtils from '../../utils/items.js';

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
            itemsWeight: {
                current: 0,
                max: 0,
                critical: false
            }
        };
    },
    computed: {
        ...mapGetters(['characterStats', 'inventory'])
    },
    mounted() {
        this.$nextTick(() => {
            this.itemsWeight.current = itemsUtils.getCurrentWeight(this.inventory);
            this.itemsWeight.max = statsUtils.getWeightFormula(this.characterStats.str);
            // In case weight limit is reaching 90%, show as critical
            this.itemsWeight.critical = (this.itemsWeight.current * 100) / this.itemsWeight.max > 90;
        });
    },
    watch: {
        inventory: {
            immediate: true,
            handler() {
                this.calculateInvetory();
            }
        }
    },
    methods: {
        showInfo(item) {
            this.itemInfo.show = true;
            this.itemInfo.id = item.id;
            this.itemInfo.name = item.name;
            this.itemInfo.type = item.class ? item.class : item.type;
            this.itemInfo.params = '';
            this.itemInfo.weaponLevel = 0;
            this.itemInfo.requiredLevel = 0;
            this.itemInfo.weight = item.weight;
            this.itemInfo.applicableJob = item.jobs === null ? 'All' : '';

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

            // Making job list human readable
            if (item.jobs) {
                for (const jobId of item.jobs) {
                    const foundJob = jobs.find((job) => job.id === jobId);

                    this.itemInfo.applicableJob += `${foundJob.name}, `;
                }

                this.itemInfo.applicableJob = this.itemInfo.applicableJob.substring(0, this.itemInfo.applicableJob.length - 2);
            }
        },
        calculateInvetory() {
            for (const item of this.inventory) {
                const foundItem = itemsUtils.getItem(item.id);

                foundItem.amount = item.amount;

                this.items.push(foundItem);
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