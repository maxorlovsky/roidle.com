<template>
    <section class="hunt-configuration">
        <div class="hunt-configuration__position">
            <p>Starting position</p>

            <div :class="{'hunt-configuration__position__item--selected': position === 'frontline'}"
                class="hunt-configuration__position__item hunt-configuration__position__item--frontline"
                @click="position = 'frontline'"
            >
                <avatar v-for="index in 3"
                    :key="index"
                    :head-style="characterHeadStyle"
                    :gender="characterGender"
                    :just-head="true"
                    job="Novice"
                />
            </div>

            <div :class="{'hunt-configuration__position__item--selected': position === 'midline'}"
                class="hunt-configuration__position__item hunt-configuration__position__item--midline"
                @click="position = 'midline'"
            >
                <avatar v-for="index in 3"
                    :key="index"
                    :head-style="characterHeadStyle"
                    :gender="characterGender"
                    :just-head="true"
                    job="Novice"
                />
            </div>

            <div :class="{'hunt-configuration__position__item--selected': position === 'backline'}"
                class="hunt-configuration__position__item hunt-configuration__position__item--backline"
                @click="position = 'backline'"
            >
                <avatar v-for="index in 3"
                    :key="index"
                    :head-style="characterHeadStyle"
                    :gender="characterGender"
                    :just-head="true"
                    job="Novice"
                />
            </div>
        </div>

        <div class="hunt-configuration__healing">
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

            <p>Healing when</p>
            <div class="healing-macro">
                <select v-model="healingWhen">
                    <option v-for="index in 9"
                        :key="index"
                        :value="10 * index"
                    >&lt; {{ 10 * index }}% HP</option>
                </select>
            </div>
        </div>

        <div class="hunt-configuration__skills">
            <p>Active skills</p>
            <div class="active-skills">
                <div v-for="(item, index) in activeSkills"
                    :key="index"
                    class="active-skills__item"
                    @click="chooseHuntActiveSkills(index)"
                >
                    <template v-if="item">
                        <img :src="`/dist/assets/images/skills/${item.id}.gif`">
                        <span class="active-skills__item__amount">{{ item.mpControl }}%</span>
                    </template>
                </div>
            </div>
        </div>

        <button :disabled="loading"
            :class="{'disabled': loading}"
            class="btn btn-lg game-button hunt-configuration__save"
            @click="saveHuntConfig()"
        >Save</button>

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
                        <img :src="`/dist/assets/images/skills/${item.id}.gif`">
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
                                <option v-for="mpControlIndex in 10"
                                    :key="mpControlIndex"
                                    :value="10 * (mpControlIndex - 1)"
                                >{{ 10 * (mpControlIndex - 1) }}% MP</option>
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
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Components
import avatar from '@components/avatar/avatar.vue';

const huntConfigurationPage = {
    components: {
        avatar,
    },
    data() {
        return {
            loading: true,
            position: 'frontline',
            showHealingModal: false,
            huntHealingItems: [null, null, null],
            healingItemsList: [],
            healingSelectedSlot: null,
            healingWhen: '10',
            showActiveSkillsModal: false,
            activeSkills: [null, null, null, null, null],
            activeSkillsList: [],
            skillSelectedSlot: null
        };
    },
    computed: {
        ...mapGetters([
            'characterHeadStyle',
            'characterGender',
            'characterSkills'
        ])
    },
    mounted() {
        mo.socket.on('getHuntConfigurationComplete', (response) => {
            if (response.position) {
                this.position = response.position;
            }

            if (response.itemToUseInHunt) {
                this.huntHealingItems = response.itemToUseInHunt;
            }

            if (response.skillsToUseInHunt) {
                this.activeSkills = response.skillsToUseInHunt;
            }

            if (response.healingHp) {
                this.healingWhen = response.healingHp;
            }

            this.loading = false;
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

        // Trigger to fetch active skills
        mo.socket.emit('getSkillsData');

        // Trigger to fetch healing items
        mo.socket.emit('getHealingItems');

        // Trigger to fetch already existing user config
        mo.socket.emit('getHuntConfiguration');

        // Hiding chat
        this.$store.commit('showChat', false);
    },
    beforeDestroy() {
        mo.socket.off('getHealingItemsComplete');
        mo.socket.off('getSkillsDataComplete');

        // Showing chat
        this.$store.commit('showChat', true);
    },
    methods: {
        saveHuntConfig() {
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
                        id: this.activeSkills[i].id,
                        level: parseInt(this.activeSkills[i].level),
                        mpControl: parseInt(this.activeSkills[i].mpControl)
                    });
                } else {
                    // For basic attack
                    skillsToUseInHunt.push(null);
                }
            }

            mo.socket.emit('updateHuntConfiguration', {
                position: this.position,
                itemToUseInHunt: itemToUseInHunt,
                skillsToUseInHunt: skillsToUseInHunt,
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
        },
        chooseHuntActiveSkills(index) {
            this.showActiveSkillsModal = true;
            this.skillSelectedSlot = index;
        },
        addActiveSkill(item) {
            this.activeSkills[this.skillSelectedSlot] = {
                id: item.id,
                level: parseInt(item.currentLevel),
                mpControl: parseInt(item.mpControl)
            };
            this.showActiveSkillsModal = false;
        },
        removeActiveSkill(slot) {
            this.activeSkills[slot] = null;
            this.showActiveSkillsModal = false;
        }
    }
};

// Routing
mo.routes.push({
    path: '/hunt-configuration',
    component: huntConfigurationPage
});

export default huntConfigurationPage;
</script>