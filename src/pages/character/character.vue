<template>
    <section class="character">
        <div class="equipment">
            <div class="equipment__left">
                <div class="equipment__head"><span class="equipment__placeholder">head</span></div>
                <div class="equipment__rhand"
                    @click="equimentList('weapon')"
                >
                    <template v-if="equipment.rhand && equipment.rhand.id">
                        <img :src="`/dist/assets/images/items/${equipment.rhand.id}.gif`">
                        {{ equipment.rhand.name }}
                    </template>
                    <span class="equipment__placeholder">R-hand</span>
                </div>
                <div class="equipment__robe"><span class="equipment__placeholder">robe</span></div>
                <div class="equipment__accessory"><span class="equipment__placeholder">accessory</span></div>
            </div>
            <div class="equipment__avatar">
                <avatar :head-style="characterHeadStyle"
                    :gender="characterGender"
                />
            </div>
            <div class="equipment__right">
                <div class="equipment__body"
                    @click="equimentList('armor', 'body')"
                >
                    <template v-if="equipment.body && equipment.body.id">
                        <img :src="`/dist/assets/images/items/${equipment.body.id}.gif`">
                        {{ equipment.body.name }}
                    </template>
                    <span class="equipment__placeholder">body</span>
                </div>
                <div class="equipment__lhand"><span class="equipment__placeholder">L-hand</span></div>
                <div class="equipment__shoes"><span class="equipment__placeholder">shoes</span></div>
                <div class="equipment__accessory"><span class="equipment__placeholder">accessory</span></div>
            </div>
        </div>

        <div v-if="showEquipmentModal"
            class="equiment-modal modal"
        >
            <template v-if="items && items.length">
                <div v-for="(item, index) in items"
                    :key="index"
                    class="equiment-modal__item"
                    @click="equipItem(item.id)"
                >
                    <img :src="`/dist/assets/images/items/${item.id}.gif`">
                    <span class="equiment-modal__item__amount">{{ item.name }}</span>
                </div>
            </template>
            <div v-else
                class="equiment-modal__item"
            >
                No items to equip
            </div>

            <div class="modal__buttons equiment-modal__buttons">
                <button class="btn btn-secondary"
                    @click="showEquipmentModal = false"
                >Cancel</button>
            </div>
        </div>

        <stats :stats="characterStats"
            :status-points="characterStatusPoints"
            :job-id="characterJobId"
            :base-level="characterBaseLevel"
            :job-level="characterJobLevel"
        />

        <button class="btn btn-warning btn-lg skills-button"
            @click="goToSkills()"
        >Skills</button>
    </section>
</template>

<script>
// 3rd party libs
import { mapGetters } from 'vuex';

// Configs
import jobs from '../../../config/jobs.json';

// Components
import avatar from '../../components/avatar/avatar.vue';
import stats from '../../components/stats/stats.vue';

// Utils
import statsUtils from '../../utils/stats.js';
import itemsUtils from '../../utils/items.js';

const characterPage = {
    components: {
        avatar,
        stats
    },
    data() {
        return {
            maxHp: 0,
            maxMp: 0,
            jobTitle: '',
            showEquipmentModal: false,
            items: [],
            type: '',
            part: '',
            equipment: {
                head: null,
                body: null,
                rhand: null,
                lhand: null,
                robe: null,
                shoes: null,
                acc1: null,
                acc2: null
            }
        };
    },
    computed: {
        ...mapGetters([
            'characterName',
            'characterStats',
            'characterStatusPoints',
            'characterBaseLevel',
            'characterJobLevel',
            'characterJobId',
            'characterHeadStyle',
            'characterGender',
            'inventory',
            'characterEquipmentTrigger'
        ])
    },
    mounted() {
        this.$nextTick(() => {
            this.calculateStats();

            const foundJob = jobs.find((job) => job.id === this.characterJobId);

            this.jobTitle = foundJob.name;
        });
    },
    watch: {
        characterEquipmentTrigger: {
            immediate: true,
            handler() {
                this.populateEquipment();
            }
        }
    },
    methods: {
        populateEquipment() {
            for (const item of Object.keys(this.$store.state.characterEquipmentSlots)) {
                if (this.$store.state.characterEquipmentSlots[item]) {
                    this.equipment[item] = itemsUtils.getItem(this.$store.state.characterEquipmentSlots[item]);
                }
            }
        },
        equipItem(itemId) {
            const item = {
                key: 0,
                item: {}
            };

            for (const [key, value] of Object.entries(this.inventory)) {
                if (value.id === itemId) {
                    item.key = key;
                    item.item = this.inventory[key];

                    break;
                }
            }

            if (!item.key) {
                console.error('[ERROR] Item that user is trying to equip is not found in inventory');

                return false;
            }

            this.$store.commit('setEquipment', {
                slot: this.part === 'body' ? 'body' : 'rhand',
                itemId: itemId
            });

            this.showEquipmentModal = false;
        },
        equimentList(type, part) {
            this.showEquipmentModal = true;
            // Rest items
            this.items = [];
            // Saving for future reference
            this.type = type;
            this.part = part;

            for (const item of this.inventory) {
                const foundItem = itemsUtils.getItem(item.id);

                // Only adding item with specific type and class
                if (foundItem.type === type || (part && foundItem.class === part) && (!foundItem.jobs || foundItem.jobs.includes(this.characterJobId))) {
                    // For inventory we need to loop each item
                    for (let i = 0; i < item.amount; ++i) {
                        this.items.push(foundItem);
                    }
                }
            }
        },
        calculateStats() {
            this.maxHp = statsUtils.getHpFormula(this.characterJobId, this.characterBaseLevel, this.characterJobLevel, this.characterStats.vit);
            this.maxMp = statsUtils.getMpFormula(this.characterJobId, this.characterBaseLevel, this.characterJobLevel, this.characterStats.wis, this.characterStats.int);
        },
        goToSkills() {
            this.$router.push('/character/skills');
        }
    }
};

// Routing
mo.routes.push({
    path: '/character',
    component: characterPage
});

export default characterPage;
</script>