<template>
    <section class="transmute-items">
        <div v-if="loading"
            class="transmute-items__wrapper"
        >
            <loading />
        </div>
        <div v-else
            class="transmute-items__wrapper"
        >
            <div class="transmute-items__list">
                <div class="transmute-items__title">Item Transmutation</div>
                <div class="transmute-items__item-title">{{ transmutableItem.name }}</div>

                <div v-for="(item, index) in transmutableItem.convertedFrom"
                    :key="index"
                    class="transmute-items__item"
                >
                    <div class="transmute-items__materials-list">
                        <div v-for="(subitem, subindex) in item.materials"
                            :key="subindex"
                            class="transmute-items__item__image-amount"
                            @click="showItemInfo(subitem)"
                        >
                            <img :src="`/dist/assets/images/items/${subitem.itemId}.gif`">
                            <span :class="{'transmute-items__item__amount--not-enough': doesNotMeetRequirements(item)}"
                                class="transmute-items__item__amount"
                            >
                                {{ getInventoryItemAmount(subitem.itemId) }} / {{ subitem.requiredAmount }}
                            </span>
                        </div>
                    </div>

                    <div class="transmute-items__item__info">
                        <div :class="{'transmute-items__item__info--not-enough': transmutableItem.requiredLevel > characterBaseLevel}">
                            Required level: {{ transmutableItem.requiredLevel }}
                        </div>
                        <div>Output per item: {{ item.output }}</div>
                        <div>XP per item: {{ item.exp }}</div>
                        <div :class="{'transmute-items__item__info--not-enough': item.mpCost > characterMp}">
                            MP Cost per item: {{ item.mpCost }}
                        </div>
                    </div>
                    <div :class="{ 'transmute-items__item__move--disabled': buttonLoading || transmutableItem.requiredLevel > characterBaseLevel || item.mpCost > characterMp || doesNotMeetRequirements(item)}"
                        class="transmute-items__item__move"
                        @click="transmuteItem(item, index)"
                    >
                        &gt;
                    </div>
                </div>
            </div>
        </div>

        <div v-if="displayAmountModal"
            class="modal"
        >
            <div class="modal__content players-shops__amount">
                <div>
                    <div class="form-heading">Amount:</div>
                    <input ref="amountValue"
                        v-model="amountValue"
                        min="0"
                        :max="maxAmount"
                        type="number"
                        size="9"
                        placeholder="Amount"
                    >
                </div>

                <div>
                    <div class="">Item output: {{ itemOutput }}</div>
                    <div class="">EXP gain: {{ expGained }}</div>
                    <div class="">MP Cost: {{ mpCost }}</div>
                </div>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="closeAmountModal()"
                >Cancel</button>
                <button :disabled="buttonLoading || amountValue < 1 || amountValue > maxAmount"
                    class="btn game-button"
                    @click="confirmTransmutation()"
                >Confirm</button>
            </div>
        </div>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import loading from '@components/loading/loading.vue';

const transmuteItemsItemPage = {
    components: {
        loading
    },
    data() {
        return {
            loading: true,
            buttonLoading: false,
            transmutableItem: null,
            transmuteId: 0,
            materialsNumber: 0,
            displayAmountModal: false,
            amountValue: 1,
            maxAmount: 0,
            itemOutput: 0,
            expGained: 0,
            mpCost: 0
        };
    },
    computed: {
        ...mapGetters([
            'characterSkills',
            'inventory',
            'characterBaseLevel',
            'characterMp'
        ])
    },
    watch: {
        amountValue() {
            let amount = Number(this.amountValue);

            if (amount < 0) {
                amount = 0;
            } else if (amount > Number(this.maxAmount)) {
                amount = Number(this.maxAmount);
            }

            this.amountValue = amount;

            this.calculateValues(amount);
        }
    },
    mounted() {
        // In case user don't have skill to transmute items we kick him back to previous page
        if (this.characterSkills[28] < 1) {
            this.$router.go(-1);
        }

        if (!this.$route.params.id) {
            // In this case we redirect user to the list of shop
            this.$router.go(-1);
        }

        mo.socket.on('transmuteItemComplete', (response) => {
            this.buttonLoading = false;

            if (response) {
                this.closeAmountModal();
            }
        });

        mo.socket.on('getTransmuteItemComplete', (response) => {
            // If response is false, meaning item is not found, so we don't have anything else to do beside just redirect user back
            if (!response) {
                this.$router.go(-1);
            }

            this.transmutableItem = response;

            this.loading = false;
        });

        mo.socket.emit('getTransmuteItem', this.$route.params.id);
    },
    beforeDestroy() {
        mo.socket.off('transmuteItemComplete');
        mo.socket.off('getTransmuteItemComplete');
    },
    methods: {
        confirmTransmutation() {
            this.buttonLoading = true;

            mo.socket.emit('transmuteItem', {
                id: this.transmuteId,
                materialsNumber: this.materialsNumber,
                amount: this.amountValue
            });
        },
        doesNotMeetRequirements(item) {
            for (const subitem of item.materials) {
                // Check if user have enough materials for at least one item transmutation, if not, returning true to block interaction
                if (this.getInventoryItemAmount(subitem.itemId) < subitem.requiredAmount) {
                    return true;
                }
            }

            // If he don't have enough MP, we do not allow him to create it, return true to block interaction
            if (item.mpCost > this.characterMp) {
                return true;
            }

            // In case everything passed we return false as a result that character do meet the requirements
            return false;
        },
        calculateValues(amount) {
            this.itemOutput = this.transmutableItem.convertedFrom[this.materialsNumber].output * amount;
            this.expGained = this.transmutableItem.convertedFrom[this.materialsNumber].exp * amount;
            this.mpCost = this.transmutableItem.convertedFrom[this.materialsNumber].mpCost * amount;
        },
        closeAmountModal() {
            this.displayAmountModal = false;
            this.transmuteId = 0;
            this.materialsNumber = 0;
            this.itemOutput = 0;
            this.expGained = 0;
            this.mpCost = 0;
            this.maxAmount = 0;
        },
        transmuteItem(item, index) {
            // Check if there is nothing blocking user to transmute
            if (this.buttonLoading || this.transmutableItem.requiredLevel > this.characterBaseLevel || item.mpCost > this.characterMp || this.doesNotMeetRequirements(item)) {
                return false;
            }

            // Save transmute id and materials number for the modal operation
            this.transmuteId = this.transmutableItem.id;
            this.materialsNumber = index;

            // Enable display, just in case user want  to transmute more items than 1
            this.displayAmountModal = true;

            // Calculating max amount
            this.maxAmount = Math.floor(this.characterMp / item.mpCost);

            // Then looping through materials to find out how much materials user have to build at most
            for (const material of this.transmutableItem.convertedFrom[this.materialsNumber].materials) {
                // Getting how much of this item character have in his inventory
                const have = this.getInventoryItemAmount(material.itemId);

                const maxAmount = Math.floor(have / material.requiredAmount);

                // Check if there are more items and if the new maxAmount is lower than the previous one, in this case we take the lowest number
                if (maxAmount < this.maxAmount) {
                    this.maxAmount = maxAmount;
                }
            }

            // Setting default amount
            this.amountValue = 1;

            this.calculateValues(this.amountValue);
        },
        getInventoryItemAmount(itemId) {
            let amount = 0;

            const findItem = this.inventory.find((item) => item.itemId === itemId);

            if (findItem) {
                amount = findItem.amount;
            }

            return amount;
        },
        showItemInfo(item) {
            mo.socket.emit('getItemInfo', {
                itemId: item.itemId
            });
        }
    }
};

// Routing
mo.routes.push({
    path: '/transmute-items/:id',
    component: transmuteItemsItemPage
});

export default transmuteItemsItemPage;
</script>