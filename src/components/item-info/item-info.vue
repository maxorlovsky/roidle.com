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
                <b>{{ name }} <template v-if="refined">+{{ refined }}</template></b>
                <div>{{ $t('itemInfo.type') }}: <span class="ucfirst">{{ itemClass ? itemClass : type }}</span> <span v-if="twoHanded">({{ $t('itemInfo.twoHanded') }})</span></div>
                <div v-if="params">{{ $t('itemInfo.params') }}: <b>{{ params }}</b></div>
                <div v-if="element"
                    class="item-info__element"
                >{{ $t('global.element') }}: <b :class="`element--${element}`">{{ element }}</b></div>
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
                    :disabled="buttonLoading || discardIsDisabled"
                    @click="discardItem()"
                >{{ $t('itemInfo.discard') }}</button>

                <button v-if="type === 'healing' || (type === 'consumable' && itemId === 602) || (type === 'consumable' && itemId === 20000)"
                    :disabled="buttonLoading"
                    class="btn game-button"
                    @click="useItem(itemId)"
                >{{ $t('itemInfo.use') }}</button>

                <button v-else-if="repairIsAvailable(type)"
                    :disabled="buttonLoading || repairIsDisabled"
                    class="btn game-button"
                    @click="repairItem(id)"
                >{{ $t('itemInfo.repair') }}</button>

                <button v-if="equipIsAvailable()"
                    :disabled="buttonLoading || equipIsDisabled"
                    class="btn btn-success"
                    @click="equipItem()"
                >{{ $t('itemInfo.equip') }}</button>
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
                        min="1"
                        :max="showDiscardAmountMax"
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
                        @click.ctrl="parseItemToChat(material.name)"
                    >
                        <img :src="`${serverUrl}/dist/assets/images/items/${material.itemId}.gif`">
                        <div :class="{'item-info__repair__materials__material__amount--found': haveEnoughMaterials(material)}"
                            class="item-info__repair__materials__material__amount"
                        >{{ material.amount }}/{{ userMaterialAmount(material.itemId) }}</div>
                    </div>
                </div>

                <b class="item-info__repair__materials-text">
                    {{ repairMaterialsText(repairMaterials) }}
                </b>

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

// Utils
import { humanReadableParams } from '@utils/inventory.js';

// Mixins
import chatMixin from '@mixins/chat.js';

export default {
    name: 'item-info',
    mixins: [chatMixin],
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
            jobs: null,
            applicableJob: '',
            broken: false,
            showDiscard: false,
            showDiscardAmount: null,
            showDiscardAmountMax: null,
            showDiscardItem: null,
            showRepair: false,
            repairMaterials: [],
            element: '',
            restriction: 0,
            refined: 0,
        };
    },
    computed: {
        ...mapGetters([
            'socketConnection',
            'characterJobId',
            'closeItemInfo',
            'selfBagItemInfo',
            'inventory',
            'characterSkills',
            'serverUrl',
            'publicItemInfo',
            'partyAvailableSkillsIds'
        ]),

        discardIsDisabled() {
            if (this.restriction >= 3) {
                return true;
            }

            return false;
        },

        repairIsDisabled() {
            if (this.buttonLoading || (this.durability === this.maxDurability && !this.broken)) {
                return true;
            }

            return false;
        },

        equipIsDisabled() {
            if (this.buttonLoading || (this.jobs && !this.jobs.includes(this.characterJobId))) {
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
        },
        showDiscardAmount() {
            let amount = Number(this.showDiscardAmount);

            if (amount < 1) {
                amount = 1;
            } else if (amount > this.showDiscardAmountMax) {
                amount = this.showDiscardAmountMax;
            }

            this.showDiscardAmount = amount;
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
        equipIsAvailable() {
            if (this.type === 'weapon' || this.type === 'armor') {
                return true;
            }

            return false;
        },
        equipItem() {
            // Triggering equip of an item on server
            mo.socket.emit('equipItem', {
                id: this.id,
                itemId: this.itemId,
                refined: this.refined,
                durability: this.durability,
                maxDurability: this.maxDurability
            });

            // Closing item info
            this.closeItemInfoModal();
        },
        repairMaterialsText(repairMaterials) {
            let materialText = '';

            for (const material of repairMaterials) {
                materialText += `${material.name} x${material.amount}, `;
            }

            materialText = materialText.substring(0, materialText.length - 2);

            return materialText;
        },
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
            if ((!this.characterSkills[32] || this.characterSkills[32] <= 0) &&
                (!this.characterSkills[33] || this.characterSkills[33] <= 0) &&
                (!this.partyAvailableSkillsIds[32] || this.partyAvailableSkillsIds[32] <= 0)
            ) {
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
            if ((!this.characterSkills[32] || this.characterSkills[32] <= 0) &&
                (!this.characterSkills[33] || this.characterSkills[33] <= 0) &&
                (!this.partyAvailableSkillsIds[32] || this.partyAvailableSkillsIds[32] <= 0)
            ) {
                this.$store.commit('sendChat', [
                    {
                        type: 'system',
                        character: 'System',
                        message: this.$t('itemInfo.repairItemDeclined'),
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
            this.element = '';
            this.durability = null;
            this.maxDurability = null;
            this.defaultDurability = 0;
            this.requiredLevel = 0;
            this.weight = item.weight;
            this.applicableJobs = item.jobs === null ? 'All' : '';
            this.jobs = item.jobs;
            this.broken = false;
            this.restriction = item.restriction;
            this.refined = item.refined;

            // Making params human readable
            if (item.params) {
                const params = humanReadableParams(item.params);

                this.element = params.element;
                this.params = params.paramsString;
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
            this.showDiscardItem = null;
        }
    }
};
</script>