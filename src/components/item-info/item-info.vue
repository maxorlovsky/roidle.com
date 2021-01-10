<template>
    <div v-if="show"
        :class="{
            'item-info--broken': broken,
            'item-info--not-pristine': durability >= 0 && durability !== null && durability < defaultDurability,
            'item-info--high-quality': durability && durability > defaultDurability
        }"
        class="item-info"
        @click="!selfBagItemInfo ? show = false : null"
    >
        <div class="item-info-wrapper">
            <img :src="`${serverUrl}/dist/assets/images/items/large/${itemId}.gif`"
                class="item-info__illustration"
            >
            <div class="item-info__description">
                <b>{{ name }}</b>
                <div>{{ $t('itemInfo.type') }}: <span class="ucfirst">{{ itemClass }}</span> <span v-if="twoHanded">({{ $t('itemInfo.twoHanded') }})</span></div>
                <div v-if="params">{{ $t('itemInfo.params') }}: <b>{{ params }}</b></div>
                <div v-if="requiredLevel">{{ $t('itemInfo.requiredLevel') }}: {{ requiredLevel }}</div>

                <div v-if="durability >= 0 && durability !== null && defaultDurability">
                    {{ $t('itemInfo.durability') }}:
                    <span :class="{'item-info__high-durability': durability > defaultDurability, 'item-info__low-durability': durability < defaultDurability}">
                        {{ durability }}
                    </span>
                    / {{ maxDurability }}
                </div>
                <div v-else-if="defaultDurability">{{ $t('itemInfo.durability') }}: {{ defaultDurability }} / {{ defaultDurability }}</div>

                <div v-if="broken"
                    class="item-info__description--broken"
                >{{ $t('itemInfo.broken') }}</div>

                <div>{{ $t('global.weight') }}: {{ weight }}</div>
                <div v-if="description">{{ description }}</div>
                <div v-if="applicableJobs">{{ $t('itemInfo.applicableJob') }}: {{ applicableJobs }}</div>
            </div>
            <div v-if="selfBagItemInfo"
                class="item-info__actions"
            >
                <button class="btn btn-secondary"
                    @click="closeItemInfoModal()"
                >{{ $t('global.close') }}</button>
                <button class="btn btn-danger"
                    :disabled="buttonLoading"
                    @click="discardItem()"
                >{{ $t('itemInfo.discard') }}</button>

                <button v-if="itemClass === 'healing' || (itemClass === 'consumable' && itemId === 602) || (itemClass === 'consumable' && itemId === 20000)"
                    :disabled="buttonLoading"
                    class="btn game-button"
                    @click="useItem(itemId)"
                >{{ $t('itemInfo.use') }}</button>
                <button v-else-if="repairIsAvailable(type)"
                    :disabled="repairIsDisabled"
                    class="btn game-button"
                    @click="repairItem(id)"
                >{{ $t('itemInfo.repair') }}</button>
            </div>

            <div v-if="showDiscard"
                class="item-info__discard"
            >
                <div class="item-info__discard__caution-text">{{ $t('itemInfo.confirmationToDiscard') }}</div>
                <div v-if="showDiscardAmountMax > 1"
                    class="item-info__discard__amount"
                >
                    <input ref="discardAmount"
                        v-model="showDiscardAmount"
                        :placeholder="$t('global.amount')"
                        type="number"
                        size="4"
                    >
                </div>
                <button class="btn btn-secondary"
                    @click="closeDiscardModal()"
                >{{ $t('global.no') }}</button>
                <button :disabled="showDiscardAmountMax > 1 && (showDiscardAmountMax < showDiscardAmount || showDiscardAmount < 1) || buttonLoading"
                    class="btn btn-danger"
                    @click="discardConfirm()"
                >{{ $t('global.yes') }}</button>
            </div>

            <div v-if="showRepair"
                class="item-info__repair"
            >
                <div class="item-info__repair__caution-text">{{ $t('itemInfo.confirmationToRepair') }}</div>
                <div class="item-info__repair__materials">
                    <div v-for="material in repairMaterials"
                        :key="material.itemId"
                        class="item-info__repair__materials__material"
                    >
                        <img :src="`${serverUrl}/dist/assets/images/items/${material.itemId}.gif`">
                        <div :class="{'item-info__repair__materials__material__amount--found': haveEnoughMaterials(material)}"
                            class="item-info__repair__materials__material__amount"
                        >{{ material.amount }}/{{ userMaterialAmount(material.itemId) }}</div>
                    </div>
                </div>

                <button class="btn btn-secondary"
                    @click="closeRepairModal()"
                >{{ $t('global.no') }}</button>
                <button :disabled="buttonLoading || doesNotMeetRepairRequirements()"
                    class="btn game-button"
                    @click="repairConfirm()"
                >{{ $t('global.yes') }}</button>
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
            buttonLoading: false,
            show: false,
            id: 0,
            itemId: 0,
            name: '',
            type: '',
            itemClass: '',
            description: '',
            params: '',
            twoHanded: false,
            requiredLevel: 0,
            durability: null,
            maxDurability: null,
            defaultDurability: 0,
            weight: 0,
            applicableJob: '',
            broken: false,
            showDiscard: false,
            showDiscardAmount: null,
            showDiscardAmountMax: null,
            showDiscardItem: null,
            showRepair: false,
            repairMaterials: []
        };
    },
    computed: {
        ...mapGetters([
            'socketConnection',
            'closeItemInfo',
            'selfBagItemInfo',
            'inventory',
            'characterSkills',
            'serverUrl',
            'publicItemInfo'
        ]),

        repairIsDisabled() {
            if (this.buttonLoading || (this.durability === this.maxDurability && !this.broken)) {
                return true;
            }

            return false;
        },
    },
    watch: {
        publicItemInfo() {
            this.showInfo(this.publicItemInfo);
        },
        socketConnection() {
            if (this.socketConnection) {
                this.setUpSocketEvents();
            }
        },
        closeItemInfo() {
            this.closeItemInfoModal();
        }
    },
    beforeDestroy() {
        mo.socket.off('merchantRepairItemComplete');
        mo.socket.off('getItemInfoComplete');
        mo.socket.off('useItemComplete');
        mo.socket.off('discardItemComplete');
        mo.socket.off('getItemRepairMaterialsComplete');
    },
    methods: {
        setUpSocketEvents() {
            mo.socket.on('merchantRepairItemComplete', (response) => {
                this.buttonLoading = false;

                if (response) {
                    this.$store.commit('sendChat', [
                        {
                            type: 'system',
                            character: 'System',
                            message: 'You successfully repaired an item'
                        }
                    ]);

                    this.closeItemInfoModal();
                }
            });

            mo.socket.on('getItemInfoComplete', (item) => {
                this.showInfo(item);
            });

            mo.socket.on('useItemComplete', () => {
                this.buttonLoading = false;
            });

            mo.socket.on('discardItemComplete', () => {
                this.buttonLoading = false;
            });

            mo.socket.on('getItemRepairMaterialsComplete', (response) => {
                this.buttonLoading = false;

                if (response) {
                    this.repairMaterials = response;
                    this.showRepair = true;
                }
            });
        },
        doesNotMeetRepairRequirements() {
            for (const material of this.repairMaterials) {
                if (!this.haveEnoughMaterials(material)) {
                    return true;
                }
            }

            return false;
        },
        haveEnoughMaterials(material) {
            const findItem = this.inventory.find((item) => item.itemId === material.itemId && item.amount >= material.amount);

            if (findItem) {
                return true;
            }

            return false;
        },
        userMaterialAmount(itemId) {
            const findItem = this.inventory.find((item) => item.itemId === itemId);

            if (!findItem) {
                return 0;
            }

            return findItem.amount;
        },
        closeRepairModal() {
            this.buttonLoading = false;
            this.repairMaterials = [];
            this.showRepair = false;
        },
        repairIsAvailable(type) {
            if ((!this.characterSkills[32] || this.characterSkills[32] <= 0) && (!this.characterSkills[33] || this.characterSkills[33] <= 0)) {
                return false;
            }

            // Do a separate if check for code readability
            if (type !== 'weapon' && type !== 'armor') {
                return false;
            }

            return true;
        },
        repairItem() {
            this.buttonLoading = true;
            this.repairMaterials = [];

            // Check if character have the skill to repair the item
            if ((!this.characterSkills[32] || this.characterSkills[32] <= 0) && (!this.characterSkills[33] || this.characterSkills[33] <= 0)) {
                this.$store.commit('sendChat', [
                    {
                        type: 'system',
                        character: 'System',
                        message: 'You don\'t have the knowledge how to repair or maintain your items (Require Maintain Item or Repair Item skill)',
                        important: true
                    }
                ]);

                this.buttonLoading = false;

                return false;
            }

            mo.socket.emit('getItemRepairMaterials', this.itemId);
        },
        repairConfirm() {
            this.buttonLoading = true;

            mo.socket.emit('merchantRepairItem', this.id);
        },
        showInfo(item) {
            if (this.selfBagItemInfo) {
                this.closeDiscardModal();
            }

            this.show = true;
            this.id = item.inventoryId;
            this.itemId = item.id;
            this.name = item.name;
            this.type = item.type;
            this.itemClass = item.class;
            this.twoHanded = item.twoHanded || false;
            this.description = item.description ? item.description : '';
            this.params = '';
            this.durability = null;
            this.maxDurability = null;
            this.defaultDurability = 0;
            this.requiredLevel = 0;
            this.weight = item.weight;
            this.applicableJobs = item.jobs === null ? 'All' : '';
            this.broken = false;

            // Making params human readable
            if (item.params) {
                for (const param of Object.keys(item.params)) {
                    this.params += `${param.toUpperCase()}: ${item.params[param]}, `;
                }

                this.params = this.params.substring(0, this.params.length - 2);
            }

            if (item.durability >= 0) {
                this.durability = item.durability;
            }

            if (item.maxDurability >= 0) {
                this.maxDurability = item.maxDurability;
            }

            if (item.defaultDurability) {
                this.defaultDurability = item.defaultDurability;
            }

            if (item.broken) {
                this.broken = true;
            }

            if (item.requireLevel) {
                this.requiredLevel = item.requireLevel;
            }

            if (item.applicableJobs) {
                this.applicableJobs = item.applicableJobs;
            }
        },
        discardItem() {
            this.showDiscard = true;

            const foundItem = this.inventory.find((item) => item.itemId === this.itemId &&
                item.durability === this.durability &&
                item.broken === this.broken);

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
            this.buttonLoading = true;

            mo.socket.emit('discardItem', {
                item: this.showDiscardItem,
                amount: this.showDiscardAmount
            });

            this.closeItemInfoModal();
        },
        useItem(itemId) {
            this.buttonLoading = true;

            mo.socket.emit('useItem', itemId);

            this.closeItemInfoModal();
        },
        closeItemInfoModal() {
            this.show = false;
            this.closeDiscardModal();
            this.closeRepairModal();
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