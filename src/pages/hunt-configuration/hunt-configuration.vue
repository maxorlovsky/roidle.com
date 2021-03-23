<template>
    <section class="hunt-configuration">
        <div class="hunt-configuration__explanation">
            <p>{{ $t('hunt.huntConfigTitle') }}</p>

            <div class="hunt-configuration__explanation__text">
                {{ $t('hunt.huntConfigExplanation') }}<br>
                <b>{{ $t('hunt.huntConfigStartingPosition') }}</b> {{ $t('hunt.huntConfigStartingPositionExplanation') }}<br>
                <b>{{ $t('hunt.huntConfigTargetPriority') }}</b> {{ $t('hunt.huntConfigTargetPriorityExplanation') }}<br>
                <b>{{ $t('hunt.notInRangeAction') }}</b> {{ $t('hunt.notInRangeActionExplanation') }}<br>
                <b>{{ $t('hunt.huntConfigEscapeSituation') }}</b> {{ $t('hunt.huntConfigEscapeSituationExplanation') }}<br>
                <b>{{ $t('hunt.huntConfigAmmo') }}</b> {{ $t('hunt.huntConfigAmmoExplanation') }}<br>
                <b>{{ $t('hunt.huntConfigHealingItems') }}</b> {{ $t('hunt.huntConfigHealingItemsExplanation') }}<br>
                <b>{{ $t('hunt.huntConfigManaItems') }}</b> {{ $t('hunt.huntConfigManaItemsExplanation') }}<br>
                <b>{{ $t('hunt.huntConfigActiveSkills') }}</b> {{ $t('hunt.huntConfigActiveSkillsExplanation') }}
            </div>
        </div>

        <div class="hunt-configuration__position">
            <p>{{ $t('hunt.startingPosition') }}</p>

            <div :class="{'hunt-configuration__position__item--selected': position === 'frontline'}"
                class="hunt-configuration__position__item hunt-configuration__position__item--frontline"
                @click="position = 'frontline'"
            >
                <avatar v-for="index in 3"
                    :key="index"
                    :head-style="characterHeadStyle"
                    :head-color="characterHeadColor"
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
                    :head-color="characterHeadColor"
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
                    :head-color="characterHeadColor"
                    :gender="characterGender"
                    :just-head="true"
                    job="Novice"
                />
            </div>
        </div>

        <div class="hunt-configuration__target-priority">
            <p>{{ $t('hunt.targetPriority') }}</p>

            <div :class="{'hunt-configuration__target-priority__item--selected': targetPriority === 'frontline'}"
                class="hunt-configuration__target-priority__item hunt-configuration__target-priority__item--frontline"
                @click="targetPriority = 'frontline'"
            >
                <avatar v-for="index in 3"
                    :key="index"
                    :head-style="characterHeadStyle"
                    :head-color="characterHeadColor"
                    :gender="characterGender"
                    :just-head="true"
                    job="Novice"
                />
            </div>

            <div :class="{'hunt-configuration__target-priority__item--selected': targetPriority === 'midline'}"
                class="hunt-configuration__target-priority__item hunt-configuration__target-priority__item--midline"
                @click="targetPriority = 'midline'"
            >
                <avatar v-for="index in 3"
                    :key="index"
                    :head-style="characterHeadStyle"
                    :head-color="characterHeadColor"
                    :gender="characterGender"
                    :just-head="true"
                    job="Novice"
                />
            </div>

            <div :class="{'hunt-configuration__target-priority__item--selected': targetPriority === 'backline'}"
                class="hunt-configuration__target-priority__item hunt-configuration__target-priority__item--backline"
                @click="targetPriority = 'backline'"
            >
                <avatar v-for="index in 3"
                    :key="index"
                    :head-style="characterHeadStyle"
                    :head-color="characterHeadColor"
                    :gender="characterGender"
                    :just-head="true"
                    job="Novice"
                />
            </div>
        </div>

        <div class="hunt-configuration__not-in-range-action">
            <p>{{ $t('hunt.notInRangeAction') }}</p>

            <div class="hunt-configuration__not-in-range-action__wrapper">
                <div class="hunt-configuration__not-in-range-action__switcher">
                    <VueToggles :value="notInRangeAction"
                        :checked-text="$t('hunt.advance')"
                        :unchecked-text="$t('hunt.idle')"
                        width="110"
                        checked-bg="#16b3fc"
                        @click="notInRangeAction = !notInRangeAction"
                    />
                </div>
            </div>
        </div>

        <div class="hunt-configuration__healing">
            <p>{{ $t('hunt.huntConfigHealingItems') }}</p>
            <div class="healing-items">
                <div v-for="(item, index) in huntHealingItems"
                    :key="index"
                    class="healing-items__item"
                    @click="chooseHuntHealingItem(index)"
                >
                    <template v-if="item">
                        <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                        <span :class="{'healing-items__item__amount--not-enough': !calculateAvailableAmount(item.itemId)}"
                            class="healing-items__item__amount"
                        >
                            {{ calculateAvailableAmount(item.itemId) }}
                        </span>
                    </template>
                </div>
            </div>

            <p>{{ $t('hunt.huntConfigHealingWhen') }}</p>
            <div class="healing-macro">
                <select v-model="healingWhen">
                    <option v-for="index in 9"
                        :key="index"
                        :value="10 * index"
                    >&lt; {{ 10 * index }}% HP</option>
                </select>
            </div>
        </div>

        <div class="hunt-configuration__healing">
            <p>{{ $t('hunt.huntConfigManaItems') }}</p>
            <div class="healing-items">
                <div v-for="(item, index) in huntManaItems"
                    :key="index"
                    class="healing-items__item"
                    @click="chooseHuntManaItem(index)"
                >
                    <template v-if="item">
                        <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                        <span :class="{'healing-items__item__amount--not-enough': !calculateAvailableAmount(item.itemId)}"
                            class="healing-items__item__amount"
                        >
                            {{ calculateAvailableAmount(item.itemId) }}
                        </span>
                    </template>
                </div>
            </div>

            <p>{{ $t('hunt.huntConfigManaWhen') }}</p>
            <div class="healing-macro">
                <select v-model="manaWhen">
                    <option v-for="index in 9"
                        :key="index"
                        :value="10 * index"
                    >&lt; {{ 10 * index }}% MP</option>
                </select>
            </div>
        </div>

        <div class="hunt-configuration__skills">
            <p>{{ $t('hunt.huntConfigActiveSkills') }}</p>
            <div class="active-skills">
                <div v-for="(item, index) in activeSkills"
                    :key="index"
                    class="active-skills__item"
                    @click="chooseHuntActiveSkills(index)"
                >
                    <template v-if="item">
                        <img :src="`${serverUrl}/dist/assets/images/skills/${item.id}.gif`">
                        <span v-if="item.hpControl"
                            class="active-skills__item__hp-control"
                        >{{ item.hpControl }}%</span>

                        <span class="active-skills__item__mp-control">{{ item.mpControl }}%</span>
                    </template>
                </div>
            </div>
        </div>

        <div class="hunt-configuration__escape">
            <p>{{ $t('hunt.huntConfigEscapeSituation') }}</p>

            <div class="hunt-configuration__escape__wrapper">
                <div class="hunt-configuration__escape__item"
                    @click="showItemInfo(602)"
                >
                    <img :src="`${serverUrl}/dist/assets/images/items/602.gif`">
                    <span :class="{'hunt-configuration__escape__item__amount--not-enough': !butterflyWingsAmount}"
                        class="hunt-configuration__escape__item__amount"
                    >
                        {{ butterflyWingsAmount }}
                    </span>
                </div>

                <select v-model="escapeWhenHp"
                    class="hunt-configuration__escape__macro"
                >
                    <option v-for="index in 9"
                        :key="index"
                        :value="10 * index"
                    >&lt; {{ 10 * index }}% HP</option>
                </select>

                <div class="hunt-configuration__escape__switcher">
                    <VueToggles :value="escapeOn"
                        :checked-text="$t('global.on')"
                        :unchecked-text="$t('global.off')"
                        checked-bg="#16b3fc"
                        @click="escapeOn = !escapeOn"
                    />
                </div>
            </div>
        </div>

        <div v-if="characterJobId === 3 || characterJobId === 6"
            class="hunt-configuration__ammo"
        >
            <p>{{ $t('hunt.huntConfigAmmo') }}</p>
            <div class="ammo">
                <div v-for="(item, index) in huntAmmo"
                    :key="index"
                    class="ammo__item"
                    @click="chooseHuntAmmo(index)"
                >
                    <template v-if="item">
                        <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                        <span :class="{'ammo__item__amount--not-enough': !calculateAvailableAmount(item.itemId)}"
                            class="ammo__item__amount"
                        >
                            {{ calculateAvailableAmount(item.itemId) }}
                        </span>
                    </template>
                </div>
            </div>
        </div>

        <button :disabled="loading"
            :class="{'disabled': loading}"
            class="btn btn-lg game-button hunt-configuration__save"
            @click="saveHuntConfig()"
        >{{ $t('global.save') }}</button>

        <div v-if="showHealingModal"
            class="items-modal modal"
        >
            <div v-if="huntHealingItems[healingSelectedSlot]"
                class="items-modal__item"
                @click="removeHealingItem(healingSelectedSlot)"
            >
                <div class="items-modal__item__image">
                    <img :src="`${serverUrl}/dist/assets/images/cancel.png`">
                </div>
                <div>
                    <div class="items-modal__item__name">{{ $t('hunt.removeItem') }}</div>
                </div>
            </div>

            <template v-if="healingItemsList && healingItemsList.length">
                <div v-for="(item, index) in healingItemsList"
                    :key="index"
                    class="items-modal__item"
                    @click="addHealingItem(item)"
                >
                    <div class="items-modal__item__image">
                        <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                    </div>
                    <div>
                        <div class="items-modal__item__name">{{ item.name }} ({{ item.amount }})</div>
                        <div class="items-modal__item__amount">{{ item.description }}</div>
                    </div>
                </div>
            </template>
            <div v-else
                class="items-modal__item"
            >
                {{ $t('hunt.noHealingItems') }}
            </div>

            <div class="modal__buttons items-modal__buttons">
                <button class="btn btn-secondary"
                    @click="showHealingModal = false"
                >{{ $t('global.cancel') }}</button>
            </div>
        </div>

        <div v-if="showManaModal"
            class="items-modal modal"
        >
            <div v-if="huntManaItems[manaSelectedSlot]"
                class="items-modal__item"
                @click="removeManaItem(manaSelectedSlot)"
            >
                <div class="items-modal__item__image">
                    <img :src="`${serverUrl}/dist/assets/images/cancel.png`">
                </div>
                <div>
                    <div class="items-modal__item__name">{{ $t('hunt.removeItem') }}</div>
                </div>
            </div>

            <template v-if="manaItemsList && manaItemsList.length">
                <div v-for="(item, index) in manaItemsList"
                    :key="index"
                    class="items-modal__item"
                    @click="addManaItem(item)"
                >
                    <div class="items-modal__item__image">
                        <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                    </div>
                    <div>
                        <div class="items-modal__item__name">{{ item.name }} ({{ item.amount }})</div>
                        <div class="items-modal__item__amount">{{ item.description }}</div>
                    </div>
                </div>
            </template>
            <div v-else
                class="items-modal__item"
            >
                {{ $t('hunt.noManaItems') }}
            </div>

            <div class="modal__buttons items-modal__buttons">
                <button class="btn btn-secondary"
                    @click="showManaModal = false"
                >{{ $t('global.cancel') }}</button>
            </div>
        </div>

        <div v-if="showAmmoModal"
            class="items-modal modal"
        >
            <div v-if="huntAmmo[ammoSelectedSlot]"
                class="items-modal__item"
                @click="removeAmmo(ammoSelectedSlot)"
            >
                <div class="items-modal__item__image">
                    <img :src="`${serverUrl}/dist/assets/images/cancel.png`">
                </div>
                <div>
                    <div class="items-modal__item__name">{{ $t('hunt.removeItem') }}</div>
                </div>
            </div>

            <template v-if="ammoList && ammoList.length">
                <div v-for="(item, index) in ammoList"
                    :key="index"
                    class="items-modal__item"
                    @click="addAmmo(item)"
                >
                    <div class="items-modal__item__image">
                        <img :src="`${serverUrl}/dist/assets/images/items/${item.itemId}.gif`">
                    </div>
                    <div>
                        <div class="items-modal__item__name">{{ item.name }} ({{ item.amount }})</div>
                        <div class="items-modal__item__amount">{{ item.description }}</div>
                    </div>
                </div>
            </template>
            <div v-else
                class="items-modal__item"
            >
                {{ $t('hunt.noAmmo') }}
            </div>

            <div class="modal__buttons items-modal__buttons">
                <button class="btn btn-secondary"
                    @click="showAmmoModal = false"
                >{{ $t('global.cancel') }}</button>
            </div>
        </div>

        <div v-if="showActiveSkillsModal"
            class="active-skill-modal modal"
        >
            <div v-if="activeSkills[skillSelectedSlot]"
                class="active-skill-modal__item"
                @click="removeActiveSkill(skillSelectedSlot)"
            >
                <div class="active-skill-modal__item__name active-skill-modal__item__name--remove">
                    <img :src="`${serverUrl}/dist/assets/images/cancel.png`">
                    <div>{{ $t('hunt.removeSkill') }}</div>
                </div>
            </div>

            <template v-if="activeSkillsList && activeSkillsList.length">
                <div v-for="(item, index) in activeSkillsList"
                    :key="index"
                    class="active-skill-modal__item"
                >
                    <div class="active-skill-modal__item__name active-skill-modal__item__name--add"
                        @click="addActiveSkill(item)"
                    >
                        <img :src="`${serverUrl}/dist/assets/images/skills/${item.id}.gif`">
                        <div>{{ item.name }} (Lv. {{ item.currentLevel }})</div>
                        <div class="active-skill-modal__add-notice">{{ $t('hunt.addSkill') }}</div>
                    </div>
                    <div class="active-skill-modal__item__macros">
                        <div class="active-skill-modal__item__mp-control">
                            <p>{{ $t('hunt.useWhileMpHigher') }}</p>
                            <select v-model="item.mpControl">
                                <option v-for="mpControlIndex in 10"
                                    :key="mpControlIndex"
                                    :value="10 * (mpControlIndex - 1)"
                                >{{ 10 * (mpControlIndex - 1) }}% MP</option>
                            </select>
                        </div>

                        <!-- Heal -->
                        <div v-if="item.id === 20"
                            class="active-skill-modal__item__hp-control"
                        >
                            <p>{{ $t('hunt.useWhenHpLower') }}</p>
                            <select v-model="item.hpControl">
                                <option v-for="hpControlIndex in 10"
                                    :key="hpControlIndex"
                                    :value="10 * (hpControlIndex - 1)"
                                >{{ 10 * (hpControlIndex - 1) }}% HP</option>
                            </select>
                        </div>
                    </div>
                </div>
            </template>
            <div v-else
                class="active-skill-modal__item"
            >
                {{ $t('hunt.noSkillsFound') }}
            </div>

            <div class="modal__buttons active-skill-modal__buttons">
                <button class="btn btn-secondary"
                    @click="showActiveSkillsModal = false"
                >{{ $t('global.cancel') }}</button>
            </div>
        </div>
    </section>
</template>

<script>
// TODO: A lot of duplicated code in here that can be optimized

// 3rd party libs
import { mapGetters } from 'vuex';
import VueToggles from 'vue-toggles';

// Components
import avatar from '@components/avatar/avatar.vue';

const huntConfigurationPage = {
    components: {
        avatar,
        VueToggles
    },
    data() {
        return {
            loading: true,
            position: 'frontline',
            targetPriority: 'frontline',
            notInRangeAction: true,
            showHealingModal: false,
            huntHealingItems: [null, null, null],
            healingItemsList: [],
            healingSelectedSlot: null,
            healingWhen: '10',
            showManaModal: false,
            huntManaItems: [null, null, null],
            manaItemsList: [],
            manaSelectedSlot: null,
            manaWhen: '10',
            showActiveSkillsModal: false,
            activeSkills: [null, null, null, null, null],
            activeSkillsList: [],
            skillSelectedSlot: null,
            escapeWhenHp: '10',
            escapeOn: false,
            showAmmoModal: false,
            huntAmmo: [null, null],
            ammoList: [],
            ammoSelectedSlot: null
        };
    },
    computed: {
        ...mapGetters([
            'characterHeadStyle',
            'characterHeadColor',
            'characterGender',
            'characterSkills',
            'characterJobId',
            'inventory',
            'serverUrl'
        ]),

        butterflyWingsAmount() {
            const item = this.inventory.find((item) => item.itemId === 602);

            return item ? item.amount : 0;
        }
    },
    mounted() {
        mo.socket.on('getHuntConfigurationComplete', (response) => {
            if (response.position) {
                this.position = response.position;
            }

            if (response.targetPriority) {
                this.targetPriority = response.targetPriority;
            }

            this.notInRangeAction = response.advanceAction;

            if (response.itemToUseInHunt) {
                this.huntHealingItems = response.itemToUseInHunt;
            }

            if (response.manaItemToUseInHunt) {
                this.huntManaItems = response.manaItemToUseInHunt;
            }

            if (response.ammoToUseInHunt) {
                this.huntAmmo = response.ammoToUseInHunt;
            }

            if (response.skillsToUseInHunt) {
                this.activeSkills = response.skillsToUseInHunt;
            }

            if (response.healingHp) {
                this.healingWhen = response.healingHp;
            }

            if (response.healingMp) {
                this.manaWhen = response.healingMp;
            }

            if (response.escapeOn) {
                this.escapeOn = response.escapeOn;
            }

            if (response.escapeHp) {
                this.escapeWhenHp = response.escapeHp;
            }

            this.loading = false;
        });

        mo.socket.on('getAmmoItemsComplete', (response) => {
            this.ammoList = response.items;
        });

        mo.socket.on('getHealingItemsComplete', (response) => {
            this.healingItemsList = response.items;
        });

        mo.socket.on('getManaItemsComplete', (response) => {
            this.manaItemsList = response.items;
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
                    // Add default HP control parameter
                    skill.hpControl = 0;
                    this.activeSkillsList.push(skill);
                }
            }
        });

        // Trigger to fetch active skills
        mo.socket.emit('getSkillsData');

        // Trigger to fetch healing items
        mo.socket.emit('getHealingItems');

        // Trigger to fetch mana restore items
        mo.socket.emit('getManaItems');

        // Trigger to fetch arrows
        mo.socket.emit('getAmmoItems');

        // Trigger to fetch already existing user config
        mo.socket.emit('getHuntConfiguration');
    },
    beforeDestroy() {
        mo.socket.off('getAmmoItemsComplete');
        mo.socket.off('getHealingItemsComplete');
        mo.socket.off('getManaItemsComplete');
        mo.socket.off('getSkillsDataComplete');
    },
    methods: {
        calculateAvailableAmount(itemId) {
            const findItem = this.inventory.find((item) => item.itemId === itemId);

            if (!findItem) {
                return 0;
            }

            return findItem.amount;
        },
        showItemInfo(itemId) {
            mo.socket.emit('getItemInfo', {
                itemId: itemId
            });
        },
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

            const manaItemToUseInHunt = [];

            for (let i = 0; i <= 2; ++i) {
                if (this.huntManaItems[i]) {
                    manaItemToUseInHunt.push({
                        itemId: this.huntManaItems[i].itemId,
                        amount: this.huntManaItems[i].amount
                    });
                }
            }

            const ammoToUseInHunt = [];

            for (let i = 0; i <= 2; ++i) {
                if (this.huntAmmo[i]) {
                    ammoToUseInHunt.push({
                        itemId: this.huntAmmo[i].itemId,
                        amount: this.huntAmmo[i].amount
                    });
                }
            }

            const skillsToUseInHunt = [];

            for (let i = 0; i <= 4; ++i) {
                if (this.activeSkills[i]) {
                    skillsToUseInHunt.push({
                        id: this.activeSkills[i].id,
                        level: parseInt(this.activeSkills[i].level),
                        mpControl: parseInt(this.activeSkills[i].mpControl),
                        hpControl: parseInt(this.activeSkills[i].hpControl)
                    });
                } else {
                    // For basic attack
                    skillsToUseInHunt.push(null);
                }
            }

            mo.socket.emit('updateHuntConfiguration', {
                position: this.position,
                targetPriority: this.targetPriority,
                advanceAction: this.notInRangeAction,
                itemToUseInHunt: itemToUseInHunt,
                manaItemToUseInHunt: manaItemToUseInHunt,
                ammoToUseInHunt: ammoToUseInHunt,
                skillsToUseInHunt: skillsToUseInHunt,
                healingHp: parseInt(this.healingWhen),
                healingMp: parseInt(this.manaWhen),
                escapeOn: this.escapeOn,
                escapeHp: parseInt(this.escapeWhenHp)
            });
        },
        chooseHuntHealingItem(index) {
            this.showHealingModal = true;
            this.healingSelectedSlot = index;

            this.showManaModal = false;
            this.showAmmoModal = false;
            this.showActiveSkillsModal = false;
        },
        addHealingItem(item) {
            let i = 0;

            // Check if same item is set in other slots and remove it
            for (const healItem of this.huntHealingItems) {
                if (healItem && healItem.itemId === item.itemId) {
                    this.huntHealingItems[i] = null;
                }

                i++;
            }

            // Add item
            this.huntHealingItems[this.healingSelectedSlot] = item;
            this.showHealingModal = false;
        },
        removeHealingItem(slot) {
            // Cleaning up the slot
            this.huntHealingItems[slot] = null;
            this.showHealingModal = false;
        },
        chooseHuntManaItem(index) {
            this.showManaModal = true;
            this.manaSelectedSlot = index;

            this.showHealingModal = false;
            this.showAmmoModal = false;
            this.showActiveSkillsModal = false;
        },
        addManaItem(item) {
            let i = 0;

            // Check if same item is set in other slots and remove it
            for (const healItem of this.huntManaItems) {
                if (healItem && healItem.itemId === item.itemId) {
                    this.huntManaItems[i] = null;
                }

                i++;
            }

            // Add item
            this.huntManaItems[this.manaSelectedSlot] = item;
            this.showManaModal = false;
        },
        removeManaItem(slot) {
            // Cleaning up the slot
            this.huntManaItems[slot] = null;
            this.showManaModal = false;
        },
        chooseHuntAmmo(index) {
            this.showAmmoModal = true;
            this.ammoSelectedSlot = index;

            this.showManaModal = false;
            this.showHealingModal = false;
            this.showActiveSkillsModal = false;
        },
        addAmmo(item) {
            let i = 0;

            // Check if same item is set in other slots and remove it
            for (const ammo of this.huntAmmo) {
                if (ammo && ammo.itemId === item.itemId) {
                    this.huntAmmo[i] = null;
                }

                i++;
            }

            // Add item
            this.huntAmmo[this.ammoSelectedSlot] = item;
            this.showAmmoModal = false;
        },
        removeAmmo(slot) {
            // Cleaning up the slot
            this.huntAmmo[slot] = null;
            this.showAmmoModal = false;
        },
        chooseHuntActiveSkills(index) {
            this.showActiveSkillsModal = true;
            this.skillSelectedSlot = index;

            this.showManaModal = false;
            this.showHealingModal = false;
            this.showAmmoModal = false;
        },
        addActiveSkill(item) {
            this.activeSkills[this.skillSelectedSlot] = {
                id: item.id,
                level: parseInt(item.currentLevel),
                mpControl: parseInt(item.mpControl),
                hpControl: parseInt(item.hpControl)
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