<template>
    <section class="trading">
        <p class="trading__title">{{ $t('trade.tradeWith') }} {{ traderRight }}</p>

        <div class="trading__inventory-wrapper">
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

            <template v-if="temporaryInventory.length">
                <div v-for="(item, index) in filteredInventory"
                    :key="index"
                    :class="{
                        'trading__inventory-wrapper__item--disabled': leftTradeApproved || buttonLoading,
                        'trading__inventory-wrapper__item--broken': item.broken,
                        'trading__inventory-wrapper__item--not-pristine': item.defaultDurability && item.durability < item.defaultDurability,
                        'trading__inventory-wrapper__item--high-quality': item.durability && item.durability > item.defaultDurability
                    }"
                    class="trading__inventory-wrapper__item"
                    @click="addItemToTrade(item)"
                >
                    <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                    <span class="inventory__item__amount">{{ item.amount }}</span>
                </div>
            </template>
            <template v-else>
                <div class="trading__inventory-wrapper__empty">{{ $t('global.empty') }}</div>
            </template>
        </div>

        <div class="trading__window">
            <div class="trading__window__wrapper">
                <div class="trading__tabs">
                    <div class="trading__tabs__left">
                        <div class="trading__tabs__header">{{ $t('trade.itemsFrom') }} {{ traderLeft }}</div>
                    </div>

                    <div class="trading__tabs__right">
                        <div class="trading__tabs__header">{{ $t('trade.itemsFrom') }} {{ traderRight }}</div>
                    </div>
                </div>

                <div :class="{'trading__window--locked': leftTradeApproved}"
                    class="trading__window__left"
                >
                    <template v-if="itemsLeft.length">
                        <div v-for="(item, index) in itemsLeft"
                            :key="index"
                            class="trading__item"
                        >
                            <div :class="{
                                'trading__item__image-amount--broken': item.broken,
                                'trading__item__image-amount--not-pristine': item.defaultDurability && item.durability < item.defaultDurability,
                                'trading__item__image-amount--high-quality': item.durability && item.durability > item.defaultDurability
                            }"
                                class="trading__item__image-amount"
                                @click="showItemInfo(item)"
                            >
                                <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                                <span v-if="item.maxDurability">
                                    {{ item.durability }}/{{ item.maxDurability }}
                                </span>
                                <span v-else>{{ item.amount }}</span>
                            </div>
                            <div class="trading__item__name-price">
                                <div class="trading__item__name-price__name">{{ item.name }}</div>
                            </div>
                            <div v-if="!leftTradeApproved"
                                class="trading__item__move"
                                @click="removeItemFromTrade(item)"
                            >
                                X
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div class="shop__empty">{{ $t('global.empty') }}</div>
                    </template>

                    <div class="trading__window__zeny">
                        <input v-model="zenyLeft"
                            :disabled="leftTradeApproved"
                            type="number"
                            min="0"
                        > <span>Z</span>
                    </div>
                </div>

                <div :class="{'trading__window--locked': rightTradeApproved}"
                    class="trading__window__right"
                >
                    <template v-if="itemsRight.length">
                        <div v-for="(item, index) in itemsRight"
                            :key="index"
                            class="trading__item"
                        >
                            <div :class="{
                                'trading__item__image-amount--broken': item.broken,
                                'trading__item__image-amount--not-pristine': item.defaultDurability && item.durability < item.defaultDurability,
                                'trading__item__image-amount--high-quality': item.durability && item.durability > item.defaultDurability
                            }"
                                class="trading__item__image-amount"
                                @click="showItemInfo(item)"
                            >
                                <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                                <span v-if="item.maxDurability">
                                    {{ item.durability }}/{{ item.maxDurability }}
                                </span>
                                <span v-else>{{ item.amount }}</span>
                            </div>
                            <div class="trading__item__name-price">
                                <div class="trading__item__name-price__name">{{ item.name }}</div>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div class="shop__empty">{{ $t('global.empty') }}</div>
                    </template>

                    <div class="trading__window__zeny">
                        <input v-model="zenyRight"
                            type="number"
                            disabled="true"
                            min="0"
                        > <span>Z</span>
                    </div>
                </div>
            </div>
            <div class="trading__window__actions">
                <button class="btn btn-secondary"
                    @click="cancelTrade()"
                >{{ $t('trade.cancelTrade') }}</button>
                <button :disabled="buttonLoading || !leftTradeApproved || !rightTradeApproved || zenyLeft < 0 || zenyLeft > characterZeny"
                    class="btn btn-success"
                    @click="confirmTrade()"
                >{{ confirmTradeMessage }}</button>
                <button :disabled="buttonLoading || leftTradeApproved || zenyLeft < 0 || zenyLeft > characterZeny"
                    class="btn game-button"
                    @click="lockTrade()"
                >{{ $t('trade.lockTrade') }}</button>
            </div>
        </div>

        <div v-if="displayAmountModal"
            class="modal"
        >
            <div class="modal__content trading__amount">
                <b>{{ moveItem.name }} <template v-if="moveItem.defaultDurability">({{ moveItem.durability }} / {{ moveItem.maxDurability }})</template></b>

                <div>
                    <div class="form-heading">{{ $t('global.amount') }}:</div>
                    <input ref="amountModal"
                        v-model="amountModal"
                        :placeholder="$t('global.amount')"
                        min="1"
                        :max="amountModalMax"
                        type="number"
                        size="4"
                    >
                </div>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="closeAmountModal()"
                >{{ $t('global.cancel') }}</button>
                <button :disabled="amountModal > amountModalMax || amountModal < 1"
                    class="btn game-button"
                    @click="confirmChosenAmount()"
                >{{ $t('trade.go') }}</button>
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

const tradingPage = {
    data() {
        return {
            buttonLoading: false,
            traderLeft: '',
            itemsLeft: [],
            zenyLeft: 0,
            leftTradeApproved: false,
            traderRight: '',
            itemsRight: [],
            zenyRight: 0,
            rightTradeApproved: false,
            temporaryInventory: [],
            displayAmountModal: false,
            amountModal: 0,
            amountModalMax: 0,
            moveItem: null,
            confirmTradeMessage: this.$t('trade.confirmTrade'),
            ignoreCancel: false,
            search: '',
        };
    },
    computed: {
        ...mapGetters([
            'characterId',
            'characterZeny',
            'inventory',
            'serverUrl'
        ]),

        filteredInventory() {
            let inv = this.temporaryInventory;

            if (this.search) {
                inv = inv.filter((item) => item.name.toLowerCase().indexOf(this.search) > -1);
            }

            return inv || [];
        }
    },
    watch: {
        amountModal() {
            if (this.amountModal > this.amountModalMax) {
                this.amountModal = this.amountModalMax;
            }

            this.amountModal = Math.floor(this.amountModal);
        },
        zenyLeft() {
            if (this.zenyLeft > this.characterZeny) {
                this.zenyLeft = this.characterZeny;
            }
        }
    },
    mounted() {
        // Put user inventory into temporary one, since it's going to be manipulated
        this.temporaryInventory = [...this.inventory];

        mo.socket.on('tradeDone', () => {
            this.ignoreCancel = true;

            this.$router.go(-1);
        });

        mo.socket.on('confirmTradeComplete', () => {
            this.confirmTradeMessage = this.$t('trade.wait');
        });

        mo.socket.on('updateTradeApproval', (response) => {
            this.buttonLoading = false;

            if (response.firstUserId === this.characterId) {
                this.zenyLeft = response.firstUserZeny;
                this.leftTradeApproved = response.firstUserApproved;
                this.zenyRight = response.secondUserZeny;
                this.rightTradeApproved = response.secondUserApproved;
            } else {
                this.zenyRight = response.firstUserZeny;
                this.rightTradeApproved = response.firstUserApproved;
                this.zenyLeft = response.secondUserZeny;
                this.leftTradeApproved = response.secondUserApproved;
            }
        });

        mo.socket.on('updateTradeItemList', (response) => {
            this.buttonLoading = false;

            if (response.firstUserId === this.characterId) {
                this.itemsLeft = response.firstUserItemsList;
                this.itemsRight = response.secondUserItemsList;
            } else {
                this.itemsLeft = response.secondUserItemsList;
                this.itemsRight = response.firstUserItemsList;
            }
        });

        mo.socket.on('tradeCleanupComplete', () => {
            this.$router.go(-1);
        });

        mo.socket.on('tradeCanceled', () => {
            this.ignoreCancel = true;

            mo.socket.emit('tradeCleanup');
        });

        mo.socket.on('cancelTradeComplete', () => {
            this.$router.go(-1);
        });

        mo.socket.on('tradeRejected', () => {
            this.$router.go(-1);
        });

        mo.socket.on('getTradingComplete', (response) => {
            // In case trading not found, we redirect user back from this page
            if (!response) {
                this.$router.go(-1);

                return false;
            }

            if (response.firstUserId === this.characterId) {
                this.traderLeft = response.firstUserName;
                this.traderRight = response.secondUserName;
                this.itemsLeft = response.firstUserItemsList;
                this.itemsRight = response.secondUserItemsList;
                this.leftTradeApproved = response.firstUserApproved;
                this.rightTradeApproved = response.secondUserApproved;
                this.zenyLeft = response.firstUserZeny;
                this.zenyRight = response.secondUserZeny;
            } else {
                this.traderLeft = response.secondUserName;
                this.traderRight = response.firstUserName;
                this.itemsLeft = response.secondUserItemsList;
                this.itemsRight = response.firstUserItemsList;
                this.leftTradeApproved = response.secondUserApproved;
                this.rightTradeApproved = response.firstUserApproved;
                this.zenyLeft = response.secondUserZeny;
                this.zenyRight = response.firstUserZeny;
            }
        });

        mo.socket.emit('getTrading');
    },
    beforeDestroy() {
        mo.socket.off('tradeDone');
        mo.socket.off('confirmTradeComplete');
        mo.socket.off('updateTradeApproval');
        mo.socket.off('updateTradeItemList');
        mo.socket.off('tradeCleanupComplete');
        mo.socket.off('tradeCanceled');
        mo.socket.off('cancelTradeComplete');
        mo.socket.off('tradeRejected');
        mo.socket.off('getTradingComplete');

        // On page exit, trigger cancel trade
        if (!this.ignoreCancel) {
            this.cancelTrade();
        }
    },
    methods: {
        confirmTrade() {
            // Only allow in case left trade is confirmed
            if (!this.leftTradeApproved) {
                return false;
            }

            // To ignore in case user will decide to refresh the page
            this.ignoreCancel = true;
            this.buttonLoading = true;

            mo.socket.emit('confirmTrade');
        },
        lockTrade() {
            // In case trade is already locked
            if (this.leftTradeApproved) {
                return false;
            }

            this.buttonLoading = true;

            mo.socket.emit('lockTrade', this.zenyLeft);
        },
        cancelTrade() {
            this.buttonLoading = true;

            mo.socket.emit('cancelTrade');
        },
        showItemInfo(item) {
            mo.socket.emit('getItemInfo', {
                itemId: item.itemId,
                inventoryId: item.id
            });
        },
        addItemToTrade(item) {
            if (this.buttonLoading || this.leftTradeApproved) {
                return false;
            }

            // Block all interaction while this happens
            this.buttonLoading = true;

            if (item.amount > 1) {
                this.moveItem = item;
                this.displayChoseAmount();
            } else {
                // Remove item from temporary inventory for the user
                const findItemIndex = this.temporaryInventory.findIndex((findItem) => findItem.id === item.id);

                this.temporaryInventory.splice(findItemIndex, 1);

                mo.socket.emit('addItemToTrade', item);
            }
        },
        displayChoseAmount() {
            this.displayAmountModal = true;
            this.amountModal = 1;
            this.amountModalMax = this.moveItem.amount;

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
            if (this.amountModal > this.amountModalMax || this.amountModal < 1 || this.leftTradeApproved) {
                return false;
            }

            const amount = Number(this.amountModal);
            const findItem = this.temporaryInventory.find((item) => item.id === this.moveItem.id);
            const findItemIndex = this.temporaryInventory.findIndex((item) => item.id === this.moveItem.id);

            if (findItem.amount === amount) {
                // Remove item from temporary inventory for the user
                this.temporaryInventory.splice(findItemIndex, 1);

                mo.socket.emit('addItemToTrade', this.moveItem);
            // In case if not, we only deducting part of it
            } else {
                // Move to temporary variable to manipulate without affecting the link
                const moveItemTemporary = { ...this.moveItem };

                moveItemTemporary.amount = amount;

                mo.socket.emit('addItemToTrade', moveItemTemporary);

                this.moveItem.amount -= amount;

                // In case after reduction amount is less than 1, we delete item
                if (this.moveItem.amount <= 0) {
                    this.temporaryInventory.splice(findItemIndex, 1);
                }
            }

            // Reset move item
            this.moveItem = null;
            // Close the modal
            this.displayAmountModal = false;
        },
        removeItemFromTrade(item) {
            // In case trade is already locked
            if (this.leftTradeApproved) {
                return false;
            }

            // Check if such item is already in user inventory
            const findItem = this.temporaryInventory.find((findItem) => findItem &&
                item &&
                findItem.id === item.id);

            // In case item found adjust amount
            if (findItem) {
                findItem.amount += item.amount;
            // If not, add it to the list
            } else {
                this.temporaryInventory.push(item);
            }

            // Send server event
            mo.socket.emit('removeItemFromTrade', item.id);
        }
    }
};

// Routing
mo.routes.push({
    path: '/trading',
    component: tradingPage
});

export default tradingPage;
</script>