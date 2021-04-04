<template>
    <section class="inventory">
        <div class="inventory-wrapper">
            <div class="inventory__top">
                <div class="inventory__weight">{{ $t('global.weight') }}: <span :class="{'inventory__weight--critical': criticalWeight}">{{ inventoryWeight }}</span> / {{ characterAttributes.weight }}</div>

                <div :class="{'inventory__top__alphabetical--active': sortAlphabetically}"
                    class="inventory__top__alphabetical inventory__top__alphabetical--desktop"
                >
                    <div class="game-icon"
                        @click="sortAtoZ()"
                    >
                        <i class="icon icon-sort-alphabetically" />
                    </div>
                </div>

                <div class="inventory__sorting">
                    <div class="inventory__sorting__label">{{ $t('global.show') }}:</div>
                    <select v-model="sortBy">
                        <option value="all">{{ $t('global.all') }}</option>
                        <option value="consumables">{{ $t('global.consumables') }}</option>
                        <option value="equipment">{{ $t('global.equipment') }}</option>
                        <option value="etc">{{ $t('global.etc') }}</option>
                    </select>
                </div>
            </div>

            <div class="inventory__search-wrapper">
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

                <div :class="{'inventory__top__alphabetical--active': sortAlphabetically}"
                    class="inventory__top__alphabetical inventory__top__alphabetical--mobile"
                >
                    <div class="game-icon"
                        @click="sortAtoZ()"
                    >
                        <i class="icon icon-sort-alphabetically" />
                    </div>
                </div>
            </div>

            <div v-for="(item, index) in filteredInventory"
                :key="index"
                :class="{
                    'inventory__item--broken': item.broken,
                    'inventory__item--not-pristine': item.defaultDurability && item.durability < item.defaultDurability,
                    'inventory__item--high-quality': item.durability && item.durability > item.defaultDurability
                }"
                class="inventory__item"
                @click.exact="showItemInfo(item)"
                @click.ctrl="parseItemToChat(item.name)"
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

// Utils
import { functions } from '@utils/functions.js';
import { sort as inventorySort } from '@utils/inventory.js';

// Mixins
import chatMixin from '@mixins/chat.js';

const inventoryPage = {
    mixins: [chatMixin],
    data() {
        return {
            search: '',
            sortBy: 'all',
            sortAlphabetically: functions.storage('get', 'sortInventory')
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

            inv = inventorySort(inv, this.sortBy);

            if (this.sortAlphabetically) {
                // eslint-disable-next-line
                inv.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
            } else {
                // eslint-disable-next-line
                inv.sort((a,b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
            }

            return inv || [];
        }
    },
    methods: {
        sortAtoZ() {
            this.sortAlphabetically = !this.sortAlphabetically;

            functions.storage('set', 'sortInventory', this.sortAlphabetically);
        },
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