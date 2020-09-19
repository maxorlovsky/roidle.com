<template>
    <div v-if="show"
        class="item-info"
        @click="!selfBagItemInfo ? show = false : null"
    >
        <div class="item-info-wrapper">
            <img :src="`/dist/assets/images/items/large/${id}.gif`"
                class="item-info__illustration"
            >
            <div class="item-info__description">
                <b>{{ name }}</b>
                <div>Type: <span class="ucfirst">{{ type }}</span> <span v-if="twoHanded">(Two-Handed)</span></div>
                <div v-if="params">Params: <b>{{ params }}</b></div>
                <div v-if="weaponLevel">Weapon Level: {{ weaponLevel }}</div>
                <div v-if="requiredLevel">Required Level: {{ requiredLevel }}</div>
                <div>Weight: {{ weight }}</div>
                <div v-if="description">{{ description }}</div>
                <div v-if="applicableJobs">Applicable Job: {{ applicableJobs }}</div>
            </div>
            <div v-if="selfBagItemInfo"
                class="item-info__actions"
            >
                <button class="btn btn-secondary"
                    @click="closeItemInfoModal()"
                >Close</button>
                <button class="btn btn-danger"
                    @click="discardItem(id)"
                >Discard</button>
                <button v-if="type === 'healing'"
                    class="btn game-button"
                    @click="useItem(id)"
                >Use</button>
            </div>

            <div v-if="showDiscard"
                class="item-info__discard"
            >
                <div class="item-info__discard__caution-text">Are you sure you want to discard this item?</div>
                <div v-if="showDiscardAmountMax > 1"
                    class="item-info__discard__amount"
                >
                    <input ref="discardAmount"
                        v-model="showDiscardAmount"
                        type="number"
                        size="4"
                        placeholder="Amount"
                    >
                </div>
                <button class="btn btn-secondary"
                    @click="closeDiscardModal()"
                >No</button>
                <button :disabled="showDiscardAmountMax > 1 && (showDiscardAmountMax < showDiscardAmount || showDiscardAmount < 1)"
                    class="btn btn-danger"
                    @click="discardConfirm()"
                >Yes</button>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

export default {
    name: 'item-info',
    data() {
        return {
            show: false,
            name: '',
            type: '',
            description: '',
            params: '',
            twoHanded: false,
            weaponLevel: 0,
            requiredLevel: 0,
            weight: 0,
            applicableJob: '',
            showDiscard: false,
            showDiscardAmount: null,
            showDiscardAmountMax: null,
            showDiscardItem: null
        };
    },
    computed: {
        ...mapGetters(['socketConnection', 'closeItemInfo', 'selfBagItemInfo', 'inventory'])
    },
    watch: {
        socketConnection() {
            if (this.socketConnection) {
                this.setUpSocketEvents();
            }
        },
        closeItemInfo() {
            this.show = false;
        }
    },
    beforeDestroy() {
        mo.socket.off('getItemsInfoComplete');
    },
    methods: {
        setUpSocketEvents() {
            mo.socket.on('getItemsInfoComplete', (items) => {
                this.showInfo(items[0]);
            });
        },
        showItemInfo(itemId) {
            mo.socket.emit('getItemsInfo', [itemId]);
        },
        showInfo(item) {
            if (this.selfBagItemInfo) {
                this.closeDiscardModal();
            }

            this.show = true;
            this.id = item.id;
            this.name = item.name;
            this.type = item.class ? item.class : item.type;
            this.twoHanded = item.twoHanded || false;
            this.description = item.description ? item.description : '';
            this.params = '';
            this.weaponLevel = 0;
            this.requiredLevel = 0;
            this.weight = item.weight;
            this.applicableJobs = item.jobs === null ? 'All' : '';

            // Making params human readable
            if (item.params) {
                for (const param of Object.keys(item.params)) {
                    this.params += `${param.toUpperCase()}: ${item.params[param]}, `;
                }

                this.params = this.params.substring(0, this.params.length - 2);
            }

            if (item.weaponLevel) {
                this.weaponLevel = item.weaponLevel;
            }

            if (item.requireLevel) {
                this.requiredLevel = item.requireLevel;
            }

            if (item.applicableJobs) {
                this.applicableJobs = item.applicableJobs;
            }
        },
        discardItem(itemId) {
            this.showDiscard = true;

            const foundItem = this.inventory.find((item) => item.itemId === itemId);

            if (foundItem && foundItem.amount > 1) {
                this.showDiscardItem = foundItem;
                this.showDiscardAmount = foundItem.amount;
                this.showDiscardAmountMax = foundItem.amount;

                // Focus on field when it appears
                this.$nextTick(() => {
                    this.$refs.discardAmount.focus();
                });
            } else {
                this.showDiscardItem = foundItem;
                this.showDiscardAmount = 1;
                this.showDiscardAmountMax = 1;
            }
        },
        discardConfirm() {
            mo.socket.emit('discardItem', {
                item: this.showDiscardItem,
                amount: this.showDiscardAmount
            });

            this.closeItemInfoModal();
        },
        useItem(itemId) {
            mo.socket.emit('useItem', itemId);

            this.closeItemInfoModal();
        },
        closeItemInfoModal() {
            this.show = false;
            this.closeDiscardModal();
        },
        closeDiscardModal() {
            this.showDiscard = false;
            this.showDiscardAmount = null;
            this.showDiscardAmountMax = null;
            this.showDiscardItem = null;
        }
    }
};
</script>