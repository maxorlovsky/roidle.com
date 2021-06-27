<template>
    <div v-if="!loading"
        class="kafra-storage"
    >
        <div class="kafra-storage-tabs">
            <div v-for="tab in mainTabs"
                :key="tab"
                :class="{'kafra-storage-tabs__tab--active': tab === selectedMainTab}"
                class="kafra-storage-tabs__tab"
                @click="selectedMainTab = tab; search = ''"
            >{{ $t(`kafra.${tab}`) }}</div>
        </div>

        <div class="kafra-storage__top-bar">
            <div class="kafra-storage__toggle">
                <div class="kafra-storage__toggle__value">
                    <label for="amountToggle">{{ $t('kafra.toggleItemAmount') }}</label>
                    <input id="amountToggle"
                        v-model="amountToggle"
                        type="checkbox"
                    >
                </div>
            </div>

            <div :class="{'kafra-storage__limit--exceeded': storageSpace > storageSpaceMax}"
                class="kafra-storage__limit"
            >
                {{ storageSpace }} / {{ storageSpaceMax }}
            </div>
        </div>

        <div class="kafra-storage__wrapper">
            <div class="kafra-storage__top">
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

                <div :class="{'kafra-storage__top__alphabetical--active': sortAlphabetically}"
                    class="kafra-storage__top__alphabetical"
                >
                    <div class="game-icon"
                        @click="sortAtoZ()"
                    >
                        <i class="icon icon-sort-alphabetically" />
                    </div>
                </div>

                <div class="kafra-storage__top__sorting">
                    <div class="kafra-storage__top__sorting__label">{{ $t('global.show') }}:</div>
                    <select v-model="sortBy">
                        <option value="all">{{ $t('global.all') }}</option>
                        <option value="consumables">{{ $t('global.consumables') }}</option>
                        <option value="equipment">{{ $t('global.equipment') }}</option>
                        <option value="etc">{{ $t('global.etc') }}</option>
                    </select>
                </div>
            </div>

            <template v-if="itemsTransfer.length">
                <div v-for="(item, index) in filteredItems"
                    :key="index"
                    class="kafra-storage__item"
                >
                    <div :class="{
                        'kafra-storage__item__image-amount--broken': item.broken,
                        'kafra-storage__item__image-amount--not-pristine': item.defaultDurability && item.durability < item.defaultDurability,
                        'kafra-storage__item__image-amount--high-quality': item.durability && item.durability > item.defaultDurability
                    }"
                        class="kafra-storage__item__image-amount"
                        @click.exact="showItemInfo(item)"
                        @click.ctrl="parseItemToChat(item.name)"
                    >
                        <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                        <span v-if="item.maxDurability">{{ item.durability }}/{{ item.maxDurability }}</span>
                        <span v-else>{{ item.amount }}</span>
                    </div>
                    <div class="kafra-storage__item__name-price">
                        <div class="kafra-storage__item__name-price__name">{{ item.itemName || item.name }} <template v-if="item.refined">+{{ item.refined }}</template></div>
                    </div>
                    <div v-if="selectedMainTab === 'withdraw'"
                        :class="{'kafra-storage__item__move--disabled': buttonLoading}"
                        class="kafra-storage__item__move"
                        @click="moveItem(item)"
                    >
                        &lt;
                    </div>
                    <div v-else
                        :class="{'kafra-storage__item__move--disabled': (storageSpace >= storageSpaceMax && !itemInStorage(item.itemId) || buttonLoading) }"
                        class="kafra-storage__item__move"
                        @click="moveItem(item)"
                    >
                        &gt;
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="kafra-storage__empty">{{ $t('global.empty') }}</div>
            </template>
        </div>

        <div v-if="displayAmountModal"
            class="modal"
        >
            <div class="modal__content kafra-storage__amount">
                <input ref="amountModal"
                    v-model="amountModal"
                    :placeholder="$t('global.amount')"
                    min="1"
                    :max="amountModalMax"
                    type="number"
                    size="4"
                >
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="closeAmountModal()"
                >{{ $t('global.cancel') }}</button>
                <button :disabled="amountModal < 1 || amountModal > amountModalMax"
                    class="btn game-button"
                    @click="confirmChosenAmount()"
                >{{ $t('kafra.confirm') }}</button>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Utilities
import { functions } from '@utils/functions.js';
import { sort as inventorySort } from '@utils/inventory.js';

// Mixins
import chatMixin from '@mixins/chat.js';

let itemsStorage = [];

const kafraStoragePage = {
    mixins: [chatMixin],
    data() {
        return {
            loading: true,
            buttonLoading: false,
            itemsTransfer: [],
            mainTabs: ['deposit', 'withdraw'],
            selectedMainTab: 'deposit',
            amountToggle: functions.storage('get', 'itemAmountToggle'),
            displayAmountModal: false,
            amountModal: 0,
            amountModalMax: 0,
            storageSpace: 0,
            storageSpaceMax: 0,
            movingItem: null,
            search: '',
            sortBy: 'all',
            sortAlphabetically: functions.storage('get', 'sortInventory')
        };
    },
    computed: {
        ...mapGetters([
            'characterZeny',
            'inventory',
            'serverUrl'
        ]),

        filteredItems() {
            let inv = this.itemsTransfer;
            let itemName = 'itemName';

            if (this.selectedMainTab === 'deposit') {
                itemName = 'name';
            }

            if (this.search) {
                inv = inv.filter((item) => item[itemName].toLowerCase().indexOf(this.search.toLowerCase()) > -1);
            }

            inv = inventorySort(inv, this.sortBy);

            if (this.sortAlphabetically) {
                // eslint-disable-next-line
                inv.sort((a,b) => (a[itemName] > b[itemName]) ? 1 : ((b[itemName] > a[itemName]) ? -1 : 0));
            } else {
                // eslint-disable-next-line
                inv.sort((a,b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
            }

            return inv || [];
        }
    },
    watch: {
        amountToggle() {
            functions.storage('set', 'itemAmountToggle', this.amountToggle);
        },
        selectedMainTab() {
            if (this.selectedMainTab === 'withdraw') {
                // Switching arrays
                this.itemsTransfer = JSON.parse(JSON.stringify(itemsStorage));
            } else {
                // Switching arrays
                this.itemsTransfer = JSON.parse(JSON.stringify(this.inventory));
            }
        },
        amountModal() {
            if (this.amountModal > this.amountModalMax) {
                this.amountModal = this.amountModalMax;
            }

            this.amountModal = Math.floor(this.amountModal);
        }
    },
    mounted() {
        // If character don't have 60 zeny for service fee, we kick him out of storage
        if (this.characterZeny < 60) {
            this.$router.push('/game');

            return false;
        }

        // Trigger open kafra storage immediately on arrival on the page
        mo.socket.emit('openKafraStorage');

        mo.socket.on('openKafraStorageComplete', (response) => {
            this.loading = false;

            // In case kafra can't be opened, we just send user back
            if (!response) {
                this.$router.go(-1);

                return false;
            }

            itemsStorage = JSON.parse(JSON.stringify(response.itemsStorage));

            this.storageSpace = response.itemsStorage.length;
            this.storageSpaceMax = response.storageSpaceMax;
            this.movingItem = null;

            // Update character zeny
            if (response.zeny) {
                this.$store.commit('saveZeny', response.zeny);
            }

            if (this.selectedMainTab === 'withdraw') {
                this.itemsTransfer = itemsStorage;
            } else {
                this.itemsTransfer = this.inventory;
            }
        });

        mo.socket.on('depositItemComplete', () => {
            this.buttonLoading = false;
        });

        mo.socket.on('withdrawItemComplete', () => {
            this.buttonLoading = false;
        });
    },
    beforeDestroy() {
        // Sending request to close Kafra from this account
        mo.socket.emit('closeKafra');

        mo.socket.off('depositItemComplete');
        mo.socket.off('withdrawItemComplete');
        mo.socket.off('openKafraStorageComplete');
    },
    methods: {
        sortAtoZ() {
            this.sortAlphabetically = !this.sortAlphabetically;

            functions.storage('set', 'sortInventory', this.sortAlphabetically);
        },
        // To check that item that is in inventory is not in storage, to be able to move it even in case storage is technically full
        itemInStorage(itemId) {
            const findIndex = this.itemsStorage.findIndex((storageItem) => storageItem.itemId === itemId && storageItem.type !== 'weapon' && storageItem.type !== 'armor');

            return findIndex >= 0;
        },
        showItemInfo(item) {
            const params = {
                itemId: item.itemId
            };

            if (this.selectedMainTab === 'withdraw') {
                params.storageId = item.id;
            } else {
                params.inventoryId = item.id;
            }

            mo.socket.emit('getItemInfo', params);
        },
        moveItem(item) {
            // Block action if previous one is still in progress
            if (this.buttonLoading) {
                return false;
            }

            const itemMoved = this.itemsTransfer.find((findItem) => findItem.id === item.id);

            this.buttonLoading = true;
            this.movingItem = itemMoved;

            // If user reached max storage amount, we don't allow him to move items inside
            if (this.selectedMainTab === 'deposit' && this.storageSpace >= this.storageSpaceMax && !this.itemInStorage(this.movingItem.itemId)) {
                this.movingItem = null;

                return false;
            }

            if (this.movingItem.amount > 1 && !this.amountToggle) {
                this.displayChoseAmount();
            // Otherwise we move the whole batch
            } else if (this.selectedMainTab === 'withdraw') {
                mo.socket.emit('withdrawItem', this.movingItem);
            } else {
                mo.socket.emit('depositItem', this.movingItem);
            }
        },
        displayChoseAmount() {
            this.displayAmountModal = true;
            this.amountModal = 1;
            this.amountModalMax = this.movingItem.amount;

            // Focus on field when it appears
            this.$nextTick(() => {
                this.$refs.amountModal.focus();
            });
        },
        closeAmountModal() {
            this.displayAmountModal = false;
            this.buttonLoading = false;
        },
        confirmChosenAmount() {
            // In case user put it more than he should
            if (this.amountModal > this.amountModalMax) {
                return false;
            }

            const amount = Number(this.amountModal);

            const movingItem = { ...this.movingItem };

            movingItem.amount = amount;

            if (this.selectedMainTab === 'withdraw') {
                mo.socket.emit('withdrawItem', movingItem);
            } else {
                mo.socket.emit('depositItem', movingItem);
            }

            this.displayAmountModal = false;
        }
    }
};

// Routing
mo.routes.push({
    path: '/kafra-storage',
    component: kafraStoragePage
});

export default kafraStoragePage;
</script>