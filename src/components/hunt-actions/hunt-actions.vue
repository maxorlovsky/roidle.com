<template>
    <div class="hunt-actions game__action">
        <div @click="openHunt()">
            <img class="game__action__image"
                src="/dist/assets/images/sword.png"
            >
            <span class="game__action__name">Hunt</span>
        </div>

        <div v-if="showHuntModal"
            class="modal"
        >
            <div class="modal__header">Confirm hunt</div>
            <div class="modal__content">
                <p>Position</p>
                <select>
                    <option>Frontline</option>
                    <option>Middleline</option>
                    <option>Backline</option>
                </select>

                <p>Time</p>
                <div class="hunt-time-buttons">
                    <button :class="{'selected': huntTime === 60}"
                        class="btn btn-light"
                        @click="huntTime = 60"
                    >1 min</button>

                    <button :class="{'selected': huntTime === 300}"
                        class="btn btn-light"
                        @click="huntTime = 300"
                    >5 min</button>

                    <button :class="{'selected': huntTime === 600}"
                        class="btn btn-light"
                        @click="huntTime = 600"
                    >10 min</button>

                    <template v-if="enableLongerHunt">
                        <button :class="{'selected': huntTime === 1800}"
                        class="btn btn-light"
                            @click="huntTime = 1800"
                        >30 min</button>
                        <button :class="{'selected': huntTime === 2700}"
                        class="btn btn-light"
                            @click="huntTime = 2700"
                        >45 min</button>
                        <button :class="{'selected': huntTime === 3600}"
                        class="btn btn-light"
                            @click="huntTime = 3600"
                        >1 hour</button>
                    </template>
                </div>

                <p>Healing items</p>
                <div class="healing-items">
                    <div v-for="(item, index) in huntHealingItems"
                        :key="index"
                        class="healing-items__item"
                        @click="chooseHuntHealingItem(index)"
                    >
                        <template v-if="item">
                            <img :src="`/dist/assets/images/items/${item.itemId}.gif`">
                            <span class="healing-items__item__amount">{{ item.amount }}</span>
                        </template>
                    </div>
                </div>

                <div class="healing-macro">
                    <p>Healing when</p>
                    <select v-model="healingWhen">
                        <option value="10">&lt; 10HP</option>
                        <option value="20">&lt; 20HP</option>
                        <option value="30">&lt; 30HP</option>
                        <option value="40">&lt; 40HP</option>
                        <option value="50">&lt; 50HP</option>
                        <option value="60">&lt; 60HP</option>
                        <option value="70">&lt; 70HP</option>
                        <option value="80">&lt; 80HP</option>
                        <option value="90">&lt; 90HP</option>
                    </select>
                </div>
            </div>
            <div class="modal__buttons">
                <button class="btn btn-secondary"
                    @click="cancelHunt()"
                >Cancel</button>
                <button :disabled="!huntTime"
                    :class="{'disabled': !huntTime}"
                    class="btn game-button"
                    @click="startHunt()"
                >Start</button>
            </div>
        </div>

        <div v-if="showHealingModal"
            class="healing-modal modal"
        >
            <div v-if="huntHealingItems[healingSelectedSlot]"
                class="healing-modal__item"
                @click="removeHealingItem(healingSelectedSlot)"
            >
                <div class="healing-modal__item__image">
                    <img src="/dist/assets/images/cancel.png">
                </div>
                <div>
                    <div class="healing-modal__item__name">Remove item</div>
                </div>
            </div>

            <template v-if="healingItemsList && healingItemsList.length">
                <div v-for="(item, index) in healingItemsList"
                    :key="index"
                    class="healing-modal__item"
                    @click="addHealingItem(item)"
                >
                    <div class="healing-modal__item__image">
                        <img :src="`/dist/assets/images/items/${item.itemId}.gif`">
                    </div>
                    <div>
                        <div class="healing-modal__item__name">{{ item.name }} ({{ item.amount }})</div>
                        <div class="healing-modal__item__amount">{{ item.description }}</div>
                    </div>
                </div>
            </template>
            <div v-else
                class="healing-modal__item"
            >
                No healing items found
            </div>

            <div class="modal__buttons healing-modal__buttons">
                <button class="btn btn-secondary"
                    @click="showHealingModal = false"
                >Cancel</button>
            </div>
        </div>
    </div>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Globals functions
import { functions } from '@src/functions.js';

export default {
    name: 'hunt-actions',
    data() {
        return {
            showHuntModal: false,
            showHealingModal: false,
            huntTime: functions.storage('get', 'huntSelectedTime') || null,
            enableLongerHunt: false,
            huntHealingItems: [null, null, null],
            healingItemsList: [],
            healingSelectedSlot: null,
            healingWhen: functions.storage('get', 'huntHealingWhen') || '10'
        };
    },
    computed: {
        ...mapGetters([
            'huntStatus',
            'characterSkills'
        ])
    },
    watch: {
        characterSkills: {
            immediate: true,
            handler() {
                if (this.characterSkills[1] >= 8) {
                    this.enableLongerHunt = true;
                }
            }
        },
        healingWhen() {
            functions.storage('set', 'huntHealingWhen', this.healingWhen);
        },
        huntTime() {
            functions.storage('set', 'huntSelectedTime', this.huntTime);
        }
    },
    mounted() {
        mo.socket.on('startHuntComplete', (response) => {
            // Marking character as in fight status
            // In case of retreat / retreating we don't retrigger the hunt
            if (response && response.status && this.huntStatus !== 'retreating') {
                this.$store.commit('huntStatus', {
                    status: 'hunting',
                    timeFinish: response.timeFinish
                });
            }
        });

        mo.socket.on('getHealingItemsComplete', (response) => {
            this.healingItemsList = response.items;
        });
    },
    beforeDestroy() {
        mo.socket.off('startHuntComplete');
        mo.socket.off('getHealingItemsComplete');
    },
    methods: {
        // Open hunt dialog
        openHunt() {
            // Reset dialogs and variables for the hunt
            this.huntHealingItems = [null, null, null];
            this.showHealingModal = false;
            this.healingItemsList = [];

            // Showing hunt modal
            this.showHuntModal = true;

            // Trigger to fetch healing items
            mo.socket.emit('getHealingItems');
        },
        cancelHunt() {
            // Reset all variables and dialogs
            this.huntHealingItems = [null, null, null];
            this.showHealingModal = false;
            this.healingItemsList = [];
            this.showHuntModal = false;
        },
        startHunt() {
            // If fight in progress, we don't start another one
            if (this.huntStatus) {
                return false;
            }

            this.showHuntModal = false;

            const itemToUseInHunt = [];

            for (let i = 0; i <= 2; ++i) {
                if (this.huntHealingItems[i]) {
                    itemToUseInHunt.push({
                        itemId: this.huntHealingItems[i].itemId,
                        amount: this.huntHealingItems[i].amount
                    });
                }
            }

            mo.socket.emit('startHunt', {
                position: 0,
                time: this.huntTime,
                itemToUseInHunt: itemToUseInHunt,
                healingHp: parseInt(this.healingWhen)
            });
        },
        chooseHuntHealingItem(index) {
            this.showHealingModal = true;
            this.healingSelectedSlot = index;
        },
        addHealingItem(item) {
            // If items is already in this slot, we first need to return it
            if (this.huntHealingItems[this.healingSelectedSlot]) {
                this.returnHealingItem(this.healingSelectedSlot);
            }

            // Add item
            this.huntHealingItems[this.healingSelectedSlot] = item;
            this.showHealingModal = false;

            // Finding index of item that we want to remove
            const itemIndex = this.healingItemsList.findIndex((findItem) => findItem.itemId === item.itemId);

            // Remove item from healing item list
            this.healingItemsList.splice(itemIndex, 1);
        },
        removeHealingItem(slot) {
            // Add item back to healing list items
            this.returnHealingItem(slot);

            // Cleaning up the slot
            this.huntHealingItems[slot] = null;
            this.showHealingModal = false;
        },
        returnHealingItem(slot) {
            // Add item back to healing list items
            this.healingItemsList.push(this.huntHealingItems[slot]);
        }
    }
};
</script>