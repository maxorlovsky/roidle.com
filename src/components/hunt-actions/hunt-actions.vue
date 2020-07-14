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
                        <option value="10">&lt; 10% HP</option>
                        <option value="20">&lt; 20% HP</option>
                        <option value="30">&lt; 30% HP</option>
                        <option value="40">&lt; 40% HP</option>
                        <option value="50">&lt; 50% HP</option>
                        <option value="60">&lt; 60% HP</option>
                        <option value="70">&lt; 70% HP</option>
                        <option value="80">&lt; 80% HP</option>
                        <option value="90">&lt; 90% HP</option>
                    </select>
                </div>

                <p>Active skills</p>
                <div class="active-skills">
                    <div v-for="(item, index) in activeSkills"
                        :key="index"
                        class="active-skills__item"
                        @click="chooseHuntActiveSkills(index)"
                    >
                        <template v-if="item">
                            <img :src="`/dist/assets/images/skills/${item.image}`">
                            <span class="active-skills__item__amount">{{ item.mpControl }}%</span>
                        </template>
                    </div>
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

        <div v-if="showActiveSkillsModal"
            class="active-skill-modal modal"
        >
            <div v-if="activeSkills[skillSelectedSlot]"
                class="active-skill-modal__item"
                @click="removeActiveSkill(skillSelectedSlot)"
            >
                <div class="active-skill-modal__item__image">
                    <img src="/dist/assets/images/cancel.png">
                </div>
                <div>
                    <div class="active-skill-modal__item__name">Remove skill</div>
                </div>
            </div>

            <template v-if="activeSkillsList && activeSkillsList.length">
                <div v-for="(item, index) in activeSkillsList"
                    :key="index"
                    class="active-skill-modal__item"
                >
                    <div class="active-skill-modal__item__image"
                        @click="addActiveSkill(item)"
                    >
                        <img :src="`/dist/assets/images/skills/${item.image}`">
                    </div>
                    <div class="active-skill-modal__item__macros">
                        <div class="active-skill-modal__item__name"
                            @click="addActiveSkill(item)"
                        >
                            {{ item.name }} (Lv. {{ item.currentLevel }})
                        </div>
                        <div class="active-skill-modal__item__mp-control">
                            <p>Use while MP is higher than</p>
                            <select v-model="item.mpControl">
                                <option value="0">0% MP</option>
                                <option value="10">10% MP</option>
                                <option value="20">20% MP</option>
                                <option value="30">30% MP</option>
                                <option value="40">40% MP</option>
                                <option value="50">50% MP</option>
                                <option value="60">60% MP</option>
                                <option value="70">70% MP</option>
                                <option value="80">80% MP</option>
                                <option value="90">90% MP</option>
                            </select>
                        </div>
                    </div>
                </div>
            </template>
            <div v-else
                class="active-skill-modal__item"
            >
                No active skills found
            </div>

            <div class="modal__buttons active-skill-modal__buttons">
                <button class="btn btn-secondary"
                    @click="showActiveSkillsModal = false"
                >Cancel</button>
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
            showActiveSkillsModal: false,
            huntTime: null,
            enableLongerHunt: false,
            huntHealingItems: [null, null, null],
            activeSkills: [null, null, null, null, null],
            healingItemsList: [],
            activeSkillsList: [],
            healingSelectedSlot: null,
            skillSelectedSlot: null,
            healingWhen: null
        };
    },
    computed: {
        ...mapGetters([
            'huntStatus',
            'characterSkills',
            'characterId'
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
            functions.storage('set', `huntHealingWhen-${this.characterId}`, this.healingWhen);
        },
        huntTime() {
            functions.storage('set', `huntSelectedTime-${this.characterId}`, this.huntTime);
        }
    },
    mounted() {
        this.huntTime = functions.storage('get', `huntSelectedTime-${this.characterId}`) || 60;
        this.healingWhen = functions.storage('get', `huntHealingWhen-${this.characterId}`) || '10';

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

        mo.socket.on('getSkillsDataComplete', (response) => {
            // Saving only active skills in the list and adding skill level of this character
            for (const skill of response) {
                // If skill have mp requirement - it's active
                // Also check if skill level is at least 1, otherwise don't add it to the list
                if (skill.mp && this.characterSkills[skill.id]) {
                    skill.currentLevel = this.characterSkills[skill.id];
                    // Add default MP control parameter
                    skill.mpControl = 0;
                    this.activeSkillsList.push(skill);
                }
            }
        });

        this.checkHuntState();
    },
    beforeDestroy() {
        mo.socket.off('startHuntComplete');
        mo.socket.off('getHealingItemsComplete');
        mo.socket.off('getSkillsDataComplete');
    },
    methods: {
        checkHuntState() {
            // If fight status is on, we need to display active hunt details
            mo.socket.emit('getHunt');
        },
        // Open hunt dialog
        openHunt() {
            // Reset dialogs and variables for the hunt
            this.huntHealingItems = [null, null, null];
            this.showHealingModal = false;
            this.healingItemsList = [];
            this.activeSkills = [null, null, null, null, null];
            this.activeSkillsList = [];

            // Showing hunt modal
            this.showHuntModal = true;

            // Trigger to fetch healing items
            mo.socket.emit('getHealingItems');

            // Trigger to fetch active skills
            mo.socket.emit('getSkillsData');
        },
        cancelHunt() {
            // Reset all variables and dialogs
            this.huntHealingItems = [null, null, null];
            this.showHealingModal = false;
            this.healingItemsList = [];
            this.activeSkills = [null, null, null, null, null];
            this.activeSkillsList = [];
            this.showHuntModal = false;
            this.showHealingModal = false;
            this.showActiveSkillsModal = false;
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

            const skillsToUseInHunt = [];

            for (let i = 0; i <= 4; ++i) {
                if (this.activeSkills[i]) {
                    skillsToUseInHunt.push({
                        skillId: this.activeSkills[i].id,
                        level: parseInt(this.activeSkills[i].currentLevel),
                        mpControl: parseInt(this.activeSkills[i].mpControl)
                    });
                } else {
                    // For basic attack
                    skillsToUseInHunt.push(null);
                }
            }

            mo.socket.emit('startHunt', {
                position: 0,
                time: this.huntTime,
                itemToUseInHunt: itemToUseInHunt,
                skillsToUseInHunt: skillsToUseInHunt,
                healingHp: parseInt(this.healingWhen)
            });
        },
        chooseHuntHealingItem(index) {
            this.showHealingModal = true;
            this.healingSelectedSlot = index;
        },
        chooseHuntActiveSkills(index) {
            this.showActiveSkillsModal = true;
            this.skillSelectedSlot = index;
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
        addActiveSkill(item) {
            this.activeSkills[this.skillSelectedSlot] = { ...item };
            this.showActiveSkillsModal = false;
        },
        removeActiveSkill(slot) {
            this.activeSkills[slot] = null;
            this.showActiveSkillsModal = false;
        },
        returnHealingItem(slot) {
            // Add item back to healing list items
            this.healingItemsList.push(this.huntHealingItems[slot]);
        }
    }
};
</script>