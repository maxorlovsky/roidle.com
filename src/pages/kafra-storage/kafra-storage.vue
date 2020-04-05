<template>
    <div v-if="!loading"
        class="kafra-storage"
    >
        <div class="kafra-storage-tabs">
            <div v-for="tab in mainTabs"
                :key="tab"
                :class="{'kafra-storage-tabs__tab--active': tab === selectedMainTab}"
                class="kafra-storage-tabs__tab"
                @click="selectedMainTab = tab"
            >{{ tab }}</div>
        </div>

        <div :class="{'kafra-storage__limit--exceeded': storageSpace > storageSpaceMax}"
            class="kafra-storage__limit"
        >
            {{ storageSpace }} / {{ storageSpaceMax }}
        </div>

        <div class="kafra-storage__wrapper">
            <template v-if="itemsTransfer.length">
                <div v-for="(item, index) in itemsTransfer"
                    :key="index"
                    class="kafra-storage__item"
                >
                    <div class="kafra-storage__item__image-amount"
                        @click="showItemInfo(item.itemId)"
                    >
                        <img :src="`/dist/assets/images/items/${item.itemId}.gif`">
                        <span v-if="item.type !== 'weapon' && item.type !== 'armor'">{{ item.amount }}</span>
                    </div>
                    <div class="kafra-storage__item__name-price">
                        <div class="kafra-storage__item__name-price__name">{{ item.itemName }}</div>
                    </div>
                    <div v-if="selectedMainTab === 'withdraw'"
                        class="kafra-storage__item__move"
                        @click="moveItem(index)"
                    >
                        &lt;
                    </div>
                    <div v-else
                        :class="{'kafra-storage__item__move--disabled': storageSpace >= storageSpaceMax && !itemInStorage(item.itemId)}"
                        class="kafra-storage__item__move"
                        @click="moveItem(index)"
                    >
                        &gt;
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="kafra-storage__empty">Empty</div>
            </template>

            <div class="kafra-storage__summary">
                <div class="kafra-storage__summary__value">
                    <label for="amountToggle">Toggle Item Amount</label>
                    <input id="amountToggle"
                        v-model="amountToggle"
                        type="checkbox"
                    >
                </div>
            </div>
        </div>

        <div v-if="displayAmountModal"
            class="modal"
        >
            <div class="modal__content">
                <input ref="amountModal"
                    v-model="amountModal"
                    type="number"
                    size="4"
                    placeholder="Amount"
                >
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="displayAmountModal = false"
                >Cancel</button>
                <button :disabled="amountModal < 1 || amountModal > amountModalMax"
                    class="btn btn-primary"
                    @click="confirmChosenAmount()"
                >Confirm</button>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Globals functions
import { functions } from '@src/functions.js';

const kafraStoragePage = {
    data() {
        return {
            loading: true,
            itemsTransfer: [],
            mainTabs: ['deposit', 'withdraw'],
            selectedMainTab: 'deposit',
            amountToggle: functions.storage('get', 'itemAmountToggle'),
            displayAmountModal: false,
            amountModal: 0,
            amountModalMax: 0,
            itemsInventory: [],
            itemsStorage: [],
            storageSpace: 0,
            storageSpaceMax: 0,
            movingItem: null
        };
    },
    computed: {
        ...mapGetters(['characterZeny'])
    },
    watch: {
        amountToggle() {
            functions.storage('set', 'itemAmountToggle', this.amountToggle);
        },
        selectedMainTab() {
            if (this.selectedMainTab === 'withdraw') {
                // Switching arrays
                this.itemsTransfer = JSON.parse(JSON.stringify(this.itemsStorage));
            } else {
                // Switching arrays
                this.itemsTransfer = JSON.parse(JSON.stringify(this.itemsInventory));
            }
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

        // Hiding chat
        this.$store.commit('showChat', false);

        mo.socket.on('openKafraStorageComplete', (response) => {
            this.loading = false;

            this.itemsInventory = response.itemsInventory;
            this.itemsStorage = response.itemsStorage;
            this.storageSpace = response.itemsStorage.length;
            this.storageSpaceMax = response.storageSpaceMax;
            this.movingItem = null;

            // Update character zeny
            if (response.zeny) {
                this.$store.commit('saveZeny', response.zeny);
            }

            if (this.selectedMainTab === 'withdraw') {
                this.itemsTransfer = JSON.parse(JSON.stringify(this.itemsStorage));
            } else {
                this.itemsTransfer = JSON.parse(JSON.stringify(this.itemsInventory));
            }
        });

        mo.socket.on('storageUpdateComplete', (response) => {
            this.$store.commit('setInventoryData', {
                inventory: response.inventory,
                inventoryWeight: response.inventoryWeight
            });
        });
    },
    beforeDestroy() {
        mo.socket.off('openKafraStorageComplete');
        mo.socket.off('storageUpdateComplete');

        // Showing chat
        this.$store.commit('showChat', true);
    },
    methods: {
        // To check that item that is in inventory is not in storage, to be able to move it even in case storage is technically full
        itemInStorage(itemId) {
            const findIndex = this.itemsStorage.findIndex((storageItem) => storageItem.itemId === itemId && storageItem.type !== 'weapon' && storageItem.type !== 'armor');

            return findIndex >= 0;
        },
        showItemInfo(itemId) {
            mo.socket.emit('getItemsInfo', [itemId]);
        },
        moveItem(index) {
            this.movingItem = this.itemsTransfer[index];

            // If user reached max storage amount, we don't allow him to move items inside
            if (this.selectedMainTab === 'deposit' && this.storageSpace >= this.storageSpaceMax && !this.itemInStorage(this.movingItem.itemId)) {
                this.movingItem = null;

                return false;
            }

            if (this.movingItem.amount > 1 && !this.amountToggle) {
                this.toggledMovedItem = index;
                this.displayChoseAmount(index);
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
        confirmChosenAmount() {
            // In case user put it more than he should
            if (this.amountModal > this.amountModalMax) {
                return false;
            }

            const amount = Number(this.amountModal);

            this.movingItem.amount = amount;

            if (this.selectedMainTab === 'withdraw') {
                mo.socket.emit('withdrawItem', this.movingItem);
            } else {
                mo.socket.emit('depositItem', this.movingItem);
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