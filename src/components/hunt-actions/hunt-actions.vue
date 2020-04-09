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
                <button class="btn btn-primary"
                    @click="huntTime = 60"
                >1 min</button>

                <button class="btn btn-primary"
                    @click="huntTime = 300"
                >5 min</button>

                <button class="btn btn-primary"
                    @click="huntTime = 600"
                >10 min</button>

                <template v-if="enableLongerHunt">
                    <button class="btn btn-primary"
                        @click="huntTime = 1800"
                    >30 min</button>
                    <button class="btn btn-primary"
                        @click="huntTime = 2700"
                    >45 min</button>
                    <button class="btn btn-primary"
                        @click="huntTime = 3600"
                    >1 hour</button>
                </template>

                <p>Healing items</p>
                <div class="healing-items">
                    <div v-for="(item, index) in huntHealingItems"
                        :key="index"
                        class="healing-items__item"
                        @click="chooseHuntHealingItem(index)"
                    >
                        <img v-if="item"
                            :src="`/dist/assets/images/items/${item}.gif`"
                        >
                        <span v-if="item"
                            class="healing-items__item__amount"
                        >{{ huntHealingItemsAmount[index] }}</span>
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
                    class="btn btn-success"
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
                    @click="addHealingItem(item.itemId, item.amount)"
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

export default {
    name: 'hunt-actions',
    data() {
        return {
            showHuntModal: false,
            showHealingModal: false,
            huntTime: null,
            enableLongerHunt: false,
            huntHealingItems: [null, null, null],
            huntHealingItemsAmount: [1, 1, 1],
            healingItemsList: [],
            healingSelectedSlot: null,
            healingWhen: '10'
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
    },
    mounted() {
        mo.socket.on('startHuntComplete', (response) => {
            // Marking character as in fight status
            if (response && response.status) {
                this.$store.commit('huntStatus', {
                    status: true,
                    timeFinish: response.timeFinish
                });
            }
        });

        mo.socket.on('stopHuntComplete', () => {
            this.$store.commit('huntStatus', {
                status: false,
                timeFinish: null
            });
        });

        mo.socket.on('getHealingItemsComplete', (response) => {
            this.healingItemsList = response.items;
        });
    },
    beforeDestroy() {
        mo.socket.off('startHuntComplete');
        mo.socket.off('stopHuntComplete');
        mo.socket.off('getHealingItemsComplete');
    },
    methods: {
        // Open hunt dialog
        openHunt() {
            this.showHuntModal = true;
            mo.socket.emit('getHealingItems');
        },
        cancelHunt() {
            this.showHuntModal = false;
            this.huntTime = null;
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
                        itemId: this.huntHealingItems[i],
                        amount: this.huntHealingItemsAmount[i]
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
        addHealingItem(itemId, amount) {
            this.huntHealingItems[this.healingSelectedSlot] = itemId;
            this.huntHealingItemsAmount[this.healingSelectedSlot] = amount;
            this.showHealingModal = false;
        },
        removeHealingItem(slot) {
            this.huntHealingItems[slot] = null;
            this.huntHealingItemsAmount[slot] = null;
            this.showHealingModal = false;
        },
    }
};
</script>